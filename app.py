import json
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_schemes", methods=["POST"])
def get_schemes():
    # ✅ Load schemes.json correctly
    with open("schemes.json", "r", encoding="utf-8") as f:
        schemes = json.load(f)

    data = request.json
    user_input = data.get("query", "").lower()
    results = []

    for scheme in schemes:
        if any(keyword.lower() in user_input for keyword in scheme.get("keywords", [])):
            results.append(scheme)

    return jsonify(results)

if __name__ == "__main__":
    app.run(debug=True)