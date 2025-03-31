from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()  # Load from .env file

app = Flask(__name__)
CORS(app)  # Enable CORS to allow frontend requests

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

@app.route('/summarize', methods=['POST'])
def summarize_comments():
    try:
        data = request.json
        comments = data.get("comments", [])

        if not comments:
            return jsonify({"summary": "No comments available to summarize."})

        # Combine all comments into a single string
        text_to_summarize = " ".join(comments)

        # Call Gemini API for summarization
        model = genai.GenerativeModel()  # Use "gemini-pro" for better summarization
        response = model.generate_content(f"Summarize the following comments: {text_to_summarize}")

        # Extract generated summary
        summary = response.text.strip() if response.text else "Summarization failed."

        return jsonify({"summary": summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
