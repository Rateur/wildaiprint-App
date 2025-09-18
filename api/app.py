from flask import Flask, jsonify, request
from tensorflow.keras.models import load_model
import numpy as np
import sqlite3
import json
from flask_cors import CORS
from PIL import Image
import os

app = Flask(__name__)
app.secret_key = "iqusgdoiqzgdpaohbpng$p^zoepobng,^pozpebngnôpzen,gn^bopzne,p"
CORS(app, resources={
    r"/*": {"origins": "http://localhost:8080"}
})

#allowed extensions for loaded track image
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

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

# allowed images extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# predict
@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return 'No image uploaded', 400

    file = request.files['image']
    if file.filename == '':
        return 'No image selected', 400

    if file and allowed_file(file.filename):
        img = Image.open(file.stream).convert("RGB")
        img = img.resize((256, 256))
        image_array = np.array(img)
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
            return jsonify({"error": "animal not found"}), 404
    
        conn.commit()
        conn.close()

        return jsonify({"animals":dict(row)})
    

# ---------------tracks------------------------
# save track
@app.route("/tracks", methods=["POST","GET"])
def tracks():
    # connection db
    conn = get_db_connection()
    cursor = conn.cursor()
    if request.method == "POST":
        new_track = request.get_json()
        # verify missing data 
        missing = [key for key in ["loc", "date", "species"] if not new_track.get(key)]
        if missing:
            return jsonify({"error": "missing data " + ', '.join(missing)}), 400
        try:
            # insert track
            cursor.execute("""
                INSERT INTO tracks (path, loc, date, animal_sp)
                VALUES (?, ?, ?, ?)
            """, ("track.jpg", new_track["loc"], new_track["date"], new_track["species"]))
            conn.commit()
            return jsonify({"message": "track added successfully"}), 201
        
        except Exception as e:
            return jsonify({"error": "Unexpected error " + str(e)}), 500
        
    elif request.method == "GET":
        cursor.execute("SELECT * FROM tracks")
        rows = cursor.fetchall()
        return jsonify([dict(row) for row in rows]), 200

    conn.close()
# ---------------animals------------------------
@app.route("/animals", methods=["Get"])
def animals():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM animals")
    rows = cursor.fetchall()
    conn.commit()
    conn.close()
    return jsonify([dict(row) for row in rows]), 200