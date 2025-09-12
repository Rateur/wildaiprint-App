from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
import sqlite3
import pandas as pd

db = SQLAlchemy()

app = Flask(__name__)
db_name = 'wildprint.db'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_name
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

df = pd.read_csv("infos_especes.csv", sep=";", encoding="utf-8", engine="python")

conn = sqlite3.connect("wildprint.db")

df.to_sql("animals", conn, if_exists="replace", index=False)
cursor = conn.cursor()
# Create tracks table with defined columns
cursor.execute("""
    CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        loc TEXT NOT NULL,
        date DATETIME NOT NULL,
        animal_sp TEXT NOT NULL,
        FOREIGN KEY (animal_sp) REFERENCES animals(species)
    )
""")
conn.commit()
conn.close()