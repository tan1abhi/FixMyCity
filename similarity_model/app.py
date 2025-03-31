from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import torch
import re
import os
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS
from dotenv import load_dotenv
import traceback

# Load .env file
load_dotenv()

# Set environment variable to disable tokenizers parallelism warning
os.environ["TOKENIZERS_PARALLELISM"] = "false"

# Get the Firebase credentials path from the environment
firebase_credentials = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace('\\n', '\n'),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_X509_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_X509_CERT_URL"),
    "universe_domain": os.getenv("FIREBASE_UNIVERSE_DOMAIN"),
}

app = Flask(__name__)
CORS(app)  # Allow all origins (for development)

# Load fine-tuned SBERT model
MODEL_PATH = os.path.join("model", "fine_tuned_sbert")
try:
    print("[INFO] Loading SBERT Model...")
    model = SentenceTransformer(MODEL_PATH, device="cpu")
    print("[INFO] SBERT Model Loaded Successfully!")
except Exception as e:
    print(f"[ERROR] Failed to load the model: {str(e)}")
    raise e

# Initialize Firebase Admin SDK
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Extract pincode from address
def extract_pincode(address):
    match = re.search(r"\b\d{6}\b", str(address))
    return match.group(0) if match else None

# Flatten description for similarity matching
def flatten_description(desc):
    if isinstance(desc, list):
        return " ".join([d.get("text", "") for d in desc])
    return desc if isinstance(desc, str) else ""

# Load issues from Firestore and prepare embeddings
def load_issues_from_firestore():
    issues_ref = db.collection("issues")
    docs = issues_ref.stream()

    records = []
    for doc in docs:
        data = doc.to_dict()

        if data.get("status", "").lower() == "resolved":
            continue

        if all(k in data for k in ["issueTitle", "description", "category", "address"]):
            pincode = extract_pincode(data["address"])
            if pincode:
                records.append({
                    "issueId": doc.id,
                    "issueTitle": data["issueTitle"],
                    "description": flatten_description(data["description"]),
                    "category": data["category"],
                    "address": data["address"],
                    "pincode": pincode,
                    "upvotes": data.get("upvotes", 0),
                    "media": data.get("media", []),
                    "status": data.get("status", "Unknown"),
                })

    print(f"[INFO] Loaded {len(records)} issues from Firestore")
    return records

# Preload issues on startup
issues_data, issue_embeddings = load_issues_from_firestore()

@app.route("/find_similar", methods=["POST"])
def find_similar():
    try:
        data = request.get_json()
        title = data.get("issueTitle")
        raw_description = data.get("description")
        category = data.get("category")
        address = data.get("address")

        if not all([title, raw_description, category, address]):
            return jsonify({"error": "Missing required fields"}), 400

        query_pincode = extract_pincode(address)
        if not query_pincode:
            return jsonify({"error": "No valid pincode found"}), 400

        query_description_flat = flatten_description(raw_description)
        query_text = title + " " + query_description_flat
        query_embedding = model.encode(query_text, convert_to_tensor=True)

        issues = load_issues_from_firestore()
        filtered_issues = [issue for issue in issues if issue["category"] == category and issue["pincode"] == query_pincode]

        if not filtered_issues:
            return jsonify({"message": "No similar issues found"}), 200

        # Compute embeddings dynamically
        filtered_texts = [issue["issueTitle"] + " " + issue["description"] for issue in filtered_issues]
        filtered_embeddings = model.encode(filtered_texts, convert_to_tensor=True)

        similarities = util.cos_sim(query_embedding, filtered_embeddings)[0]
        top_n = min(5, len(similarities))
        top_indices = torch.topk(similarities, k=top_n).indices.tolist()

        results = []
        for i in top_indices:
            issue = filtered_issues[i]
            results.append({
                "issueId": issue["issueId"],
                "title": issue["issueTitle"],
                "description": issue["description"],
                "category": issue["category"],
                "address": issue["address"],
                "upvotes": issue.get("upvotes", 0),
                "media": issue.get("media", []),
                "similarity_score": round(similarities[i].item(), 4),
                "status": issue.get("status", "Unknown"),
            })

        return jsonify({"similar_issues": results}), 200

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    # ✅ Bind to `0.0.0.0` for deployment & change port if needed
    app.run(host="0.0.0.0", port=5000, debug=True)
