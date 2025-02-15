from flask import Flask, request, jsonify
from textblob import TextBlob

app = Flask(__name__)

@app.route('/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        # Get feedback comments from request
        data = request.json
        feedback = data.get('feedback', [])

        if not feedback:
            return jsonify({"message": "No feedback provided"}), 400

        # Analyze sentiment for each comment
        total_polarity = 0
        for comment in feedback:
            blob = TextBlob(comment)
            total_polarity += blob.sentiment.polarity

        # Calculate average sentiment
        sentiment_score = total_polarity / len(feedback)

        # Determine overall sentiment
        if sentiment_score > 0:
            sentiment = "Positive"
        elif sentiment_score < 0:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

        return jsonify({"sentiment": sentiment}), 200

    except Exception as e:
        return jsonify({"message": "Error analyzing sentiment", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
