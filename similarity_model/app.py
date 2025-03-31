from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
import torch
import re
import os
import firebase_admin
from firebase_admin import credentials, firestore
from flask_cors import CORS
from dotenv import load_dotenv


# Load .env file
load_dotenv()

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
model = SentenceTransformer(MODEL_PATH)

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

        # Skip resolved issues
        if data.get("status", "").lower() == "resolved":
            print(f"[SKIP] Resolved issue skipped: {doc.id}")
            continue

        required_fields = ["issueTitle", "description", "category", "address"]
        missing_fields = [k for k in required_fields if not data.get(k)]

        if not missing_fields:
            pincode = extract_pincode(data["address"])
            if pincode:
                # 🔹 Ensure description is stored as a list of dictionaries
                descriptions = data.get("description", [])
                
                # Convert all entries to dictionary format
                extracted_descriptions = []
                for d in descriptions:
                    if isinstance(d, dict):  # ✅ Already correct format
                        extracted_descriptions.append({
                            "text": d.get("text", ""),
                            "date": d.get("date", None)
                        })
                    elif isinstance(d, str):  # 🔹 Convert from string to dictionary
                        extracted_descriptions.append({
                            "text": d,
                            "date": None  # No date available
                        })

                records.append({
                    "issueId": doc.id,
                    "issueTitle": data["issueTitle"],
                    "description": extracted_descriptions,  # ✅ Always list of dicts now
                    "category": data["category"],
                    "address": data["address"],
                    "pincode": pincode,
                    "upvotes": data.get("upvotes", 0),
                    "media": data.get("media", []),
                    "dateOfComplaint": data.get("dateOfComplaint", None),
                    "status": data.get("status", "Unknown")  # ✅ Include status
                })
            else:
                print(f"[SKIP] No pincode found for address: {data['address']}")
        else:
            print(f"[SKIP] Missing fields: {missing_fields} in document: {data}")

    if not records:
        print("[ERROR] No valid issues loaded from Firestore.")
        return [], torch.tensor([])

    print(f"[INFO] Loaded {len(records)} issues from Firestore")

    # Create embeddings using flattened descriptions
    combined_texts = [
        r["issueTitle"] + " " + flatten_description(r["description"]) for r in records
    ]
    embeddings = model.encode(combined_texts, convert_to_tensor=True)

    return records, embeddings

# Preload issues on startup
issues_data, issue_embeddings = load_issues_from_firestore()

@app.route("/find_similar", methods=["POST"])
def find_similar():
    data = request.get_json()

    title = data.get("issueTitle")
    raw_description = data.get("description")  # Original structure
    category = data.get("category")
    address = data.get("address")

    if not all([title, raw_description, category, address]):
        return jsonify({"error": "Missing one or more required fields."}), 400

    query_pincode = extract_pincode(address)
    if not query_pincode:
        return jsonify({"error": "No valid pincode found in the address."}), 400

    # Flatten description for similarity search
    query_description_flat = flatten_description(raw_description)

    # Filter issues by category and pincode
    filtered = []
    for i, issue in enumerate(issues_data):
        issue_address = issue.get("address", "")
        issue_pincode = extract_pincode(issue_address)
        issue_category = issue.get("category")

        print(f"[DEBUG] Issue {i}: Category = {issue_category}, Pincode = {issue_pincode}")

        if issue_category == category and issue_pincode == query_pincode:
            filtered.append((i, issue))

    if not filtered:
        return jsonify({"message": "No similar issues found in same category and pincode."}), 200

    # Prepare filtered embeddings
    filtered_indices = [i for i, _ in filtered]
    filtered_issues = [issue for _, issue in filtered]
    filtered_embeddings = issue_embeddings[filtered_indices]

    # Embed user input
    query_text = title + " " + query_description_flat
    query_embedding = model.encode(query_text, convert_to_tensor=True)

    # Similarity calculation
    similarities = util.cos_sim(query_embedding, filtered_embeddings)[0]
    top_n = min(5, len(similarities))
    top_indices = torch.topk(similarities, k=top_n).indices.tolist()

    results = []
    for i in top_indices:
        issue = filtered_issues[i]
        results.append({
            "issueId": issue["issueId"],
            "title": issue["issueTitle"],
            "description": issue["description"],  # ✅ Include list of descriptions with dates
            "category": issue["category"],
            "address": issue["address"],
            "upvotes": issue.get("upvotes", 0),
            "media": issue.get("media", []),
            "similarity_score": round(similarities[i].item(), 4),
            "dateOfComplaint": issue.get("dateOfComplaint", None),
            "status": issue.get("status", "Unknown")  # ✅ Include status field
        })

    return jsonify({"similar_issues": results}), 200

@app.route("/", methods=["GET"])
def root():
    return "✅ Firestore-powered AI Similar Issue Finder is Running!", 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
