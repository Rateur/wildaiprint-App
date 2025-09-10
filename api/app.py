from flask import Flask, jsonify, request
import sqlite3

app = Flask(__name__)
app.secret_key = "iqusgdoiqzgdpaohbpng$p^zoepobng,^pozpebngnôpzen,gn^bopzne,p"

# db connection
def get_db_connection():
    conn = sqlite3.connect('wildprint.db')  
    conn.row_factory = sqlite3.Row         
    return conn

# ---------------animals------------------------
# find animals by species
@app.route("/animals/<species>", methods=["GET"])
def get_animal(species):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM animals WHERE species = ?", (species,))
    row = cursor.fetchone()
    conn.close()

    if row is None:
        return jsonify({"error": "animal non trouvé"}), 404

    return jsonify(dict(row))

# ---------------tracks-------------------------
# save track
@app.route("/tracks", methods=["POST"])
def create_track():
    data = request.get_json()

    required_fields = ["path", "loc", "date", "species"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Champs manquants"}), 400

    # find animal_id with species
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM animals WHERE species = ?", (data["species"],))
    result = cursor.fetchone()

    if result is None:
        conn.close()
        return jsonify({"error": "Espèce non trouvée"}), 404

    animal_id = result["id"]

    # insert track
    try:
        cursor.execute("""
            INSERT INTO tracks (path, loc, date, animal_id)
            VALUES (?, ?, ?, ?)
        """, (data["path"], data["loc"], data["date"], animal_id))
        conn.commit()
        conn.close()
        return jsonify({"message": "Trace ajoutée avec succès"}), 201
    except sqlite3.IntegrityError as e:
        conn.close()
        return jsonify({"error": str(e)}), 409

app.run(debug=True)