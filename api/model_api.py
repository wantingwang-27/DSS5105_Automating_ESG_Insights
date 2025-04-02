from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# ✅ Load your trained model
model_path = os.path.join(os.path.dirname(__file__), "model_overall.pkl")
model = joblib.load(model_path)

@app.route('/ping')
def ping():
    return "pong", 200

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Extract features with safe defaults
        features = [
            data.get("emissions", 0),
            data.get("carbon", 0),
            data.get("diversity", 0),
            data.get("board", 0),
            data.get("governance", 0)
        ]

        prediction = model.predict([features])[0]
        return jsonify({
            "predicted_overall": round(prediction, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    print("🚀 Flask app starting...")
    app.run(port=5050, debug=True)
