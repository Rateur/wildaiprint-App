import pytest
from api.app import app
from io import BytesIO
from PIL import Image
import sqlite3
from flask import g

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['DATABASE'] = ':memory:'
    with app.test_client() as client:
        with app.app_context():
            # Crée la table en mémoire
            conn = sqlite3.connect(app.config['DATABASE'])
            conn.execute("""
                CREATE TABLE tracks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path TEXT,
                    loc TEXT,
                    date TEXT,
                    animal_sp TEXT
                )
            """)
            conn.commit()
            g._database = conn  
        yield client

# ---------------- predictions ---------------------
# test predict route
def test_predict_route(client):
   # Create an image
    img = Image.new('RGB', (100, 100), color='black')
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)

    # send a POST request
    response = client.post('/predict', content_type='multipart/form-data', data={
        'image': (img_bytes, 'test.jpg')
    })
    # verify http code
    assert response.status_code == 200
    # verify json content
    data = response.get_json()
    assert "species" in data  


# ---------------- tracks ---------------------
# test add tracks route
def test_tracks_success(client):
    payload = {
        "loc": "Lyon",
        "date": "2025-09-18",
        "species": "Chat"
    }

    response = client.post("/tracks", json=payload)
    assert response.status_code == 201
    assert response.get_json()["message"] == "track added successfully"


# test missing data
def test_tracks_missing_data(client):
    payload = {
        "loc": "Lyon",
        "date": "2025-09-18"
        # species is missing
    }

    response = client.post("/tracks", json=payload)
    assert response.status_code == 400
    assert "missing data species" in response.get_json()["error"]
# get all tracks
def test_get_tracks(client):
    response = client.get("/tracks")
    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert "animal_sp" in data  


# ---------------- animals ---------------------
# get all animals
def test_get_animals(client):
    response = client.get("/animals")
    assert response.status_code == 200

    data = response.get_json()
    assert isinstance(data, list)
    assert "species" in data  