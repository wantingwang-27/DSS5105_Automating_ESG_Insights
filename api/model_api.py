from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json
from openai import OpenAI
from dotenv import load_dotenv

# ----------------------------
# 🔐 Load OpenAI API Key
# ----------------------------
load_dotenv()
client = OpenAI()

# Optional debug print
print("🔑 Loaded OpenAI key from environment...")

# ----------------------------
# 🚀 Flask Setup
# ----------------------------
app = Flask(__name__)
CORS(app)

# ----------------------------
# 🧠 Load Your ML Model
# ----------------------------
model_path = os.path.join(os.path.dirname(__file__), "model_overall.pkl")
model = joblib.load(model_path)

# ----------------------------
# ✅ Routes
# ----------------------------

@app.route('/ping')
def ping():
    return "pong", 200


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        features = [
            data.get("emissions", 0),
            data.get("carbon", 0),
            data.get("diversity", 0),
            data.get("board", 0),
            data.get("governance", 0)
        ]
        prediction = model.predict([features])[0]
        return jsonify({"predicted_overall": round(prediction, 2)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/generate_summary", methods=["POST"])
def generate_summary():
    text = request.json.get("text", "")
    summary = generate_esg_summary(text)
    return jsonify({"summary": summary})


def generate_esg_summary(text):
    environmental_keywords = ["carbon", "climate", "sustainability", "renewable", "emissions", "energy"]
    social_keywords = ["diversity", "labor", "human rights", "community", "employee", "welfare"]
    governance_keywords = ["board", "transparency", "audit", "corruption", "ethics", "compliance"]

    sections = {"Environmental": [], "Social": [], "Governance": []}

    for line in text.split("\n"):
        l = line.lower()
        if any(k in l for k in environmental_keywords):
            sections["Environmental"].append(line.strip())
        if any(k in l for k in social_keywords):
            sections["Social"].append(line.strip())
        if any(k in l for k in governance_keywords):
            sections["Governance"].append(line.strip())

    def clean(lines): return " ".join(lines[:3]) if lines else "No mention found."

    return {
        "Environmental": clean(sections["Environmental"]),
        "Social": clean(sections["Social"]),
        "Governance": clean(sections["Governance"])
    }


@app.route("/gpt_esg_score", methods=["POST"])
def gpt_esg_score():
    try:
        text = request.json.get("text", "")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        prompt = f"""
You are a certified ESG analyst. Based on the following ESG report, provide numerical scores for:

- Environmental (0–100)
- Social (0–100)
- Governance (0–100)
- Overall ESG Score (average of the above three)

For each component (E, S, G), include a 1-paragraph insight to explain the score.

Return ONLY valid JSON in this format:
{{
  "Environmental": {{ "score": int, "insight": str }},
  "Social": {{ "score": int, "insight": str }},
  "Governance": {{ "score": int, "insight": str }},
  "Overall": int
}}

### Examples:

---

📝 Example Report 1:
This company has implemented renewable energy strategies, reduced CO2 emissions, and engages in biodiversity preservation. It promotes community volunteerism, maintains inclusive hiring practices, and provides strong employee protections. Its governance structure includes an independent board, regular audits, and detailed public disclosures.

📊 Response:
{{
  "Environmental": {{ "score": 90, "insight": "The company has robust environmental initiatives such as renewable energy and biodiversity preservation." }},
  "Social": {{ "score": 85, "insight": "Strong community and labor practices are evident, along with inclusion policies." }},
  "Governance": {{ "score": 88, "insight": "Independent governance mechanisms and transparency are strong." }},
  "Overall": 88
}}

---

📝 Example Report 2:
The firm has no mention of sustainability policies, provides little transparency in financial reporting, and lacks diversity in executive leadership. Employee programs and stakeholder engagement appear minimal.

📊 Response:
{{
  "Environmental": {{ "score": 40, "insight": "Minimal or no focus on environmental responsibility." }},
  "Social": {{ "score": 45, "insight": "Lack of stakeholder engagement and social programs results in a low score." }},
  "Governance": {{ "score": 38, "insight": "Governance structure is weak with no diversity or transparency mechanisms." }},
  "Overall": 41
}}

---

Now, analyze the following ESG report:
{text}
"""


        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5
        )

        content = response.choices[0].message.content.strip()

        try:
            parsed = json.loads(content)
            return jsonify(parsed)
        except json.JSONDecodeError:
            try:
                parsed = eval(content)  # fallback for slightly invalid formatting
                return jsonify(parsed)
            except Exception:
                return jsonify({"error": "Failed to parse GPT response", "raw": content}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------
# 🚀 Run App
# ----------------------------
if __name__ == '__main__':
    print("🚀 Flask app starting...")
    app.run(port=5050, debug=True)
