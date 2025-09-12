from flask import Flask, jsonify, request
from tensorflow.keras.models import load_model
import numpy as np
import sqlite3
import json
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = "iqusgdoiqzgdpaohbpng$p^zoepobng,^pozpebngnôpzen,gn^bopzne,p"
CORS(app, resources={r"/predict": {"origins": "http://localhost:8080"}})

# db connection
def get_db_connection():
    conn = sqlite3.connect('wildprint.db')  
    conn.row_factory = sqlite3.Row         
    return conn
# page test
@app.route("/", methods=["GET"])
def home():
    return "API Flask ✅"

# ---------------predictions------------------------

# load CNN
model = load_model("api/model.keras")  

# load class names
try:
    with open("class_names.json", "r") as f:
        class_names = json.load(f)
except Exception as e:
    class_names = []
    print("Erreur lors du chargement des classes :", e)

# predict
@app.route("/predict", methods=["POST"])
def predict():
   
    # Traitement du POST
    data = request.get_json()
    image_array = np.array(data.get("image"))

    if image_array is None:
        return jsonify({"error": "No image data provided"}), 400

    image_array = np.expand_dims(image_array, axis=0)
    prediction = model.predict(image_array)
    predicted_index = int(np.argmax(prediction[0]))
    predicted_label = class_names[predicted_index]

    # connection db
    conn = get_db_connection()
    cursor = conn.cursor()
    # find animal
    cursor.execute("SELECT * FROM animals WHERE species = ?", (predicted_label,))
    row = cursor.fetchone()

    if row is None:
        conn.close()
        return jsonify({"error": "animal not found"}), 404
    # insert track
    cursor.execute("""
        INSERT INTO tracks (path, loc, date, animal_sp)
        VALUES (?, ?, ?, ?)
    """, (data["path"], data["loc"], data["date"], predicted_label))
    conn.commit()
    conn.close()

    return jsonify(dict(row))




