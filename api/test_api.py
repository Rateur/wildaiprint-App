import os
import shutil
from io import BytesIO

import numpy as np
import pytest
from PIL import Image

import api.app as api
from api.app import app


@pytest.fixture
def client(tmp_path, monkeypatch):
    # a copy of the real database (13 species, no track): the tests never write to the real one
    db = tmp_path / "wildprint.db"
    shutil.copy(app.config["DATABASE"], db)
    monkeypatch.setitem(app.config, "DATABASE", str(db))
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def black_jpeg():
    img_bytes = BytesIO()
    Image.new("RGB", (100, 100), color="black").save(img_bytes, format="JPEG")
    img_bytes.seek(0)
    return img_bytes


class FakeModel:
    # stands in for the CNN: checks the input it gets, always answers the third class
    def predict(self, batch):
        assert batch.shape == (1, 256, 256, 3)
        scores = np.zeros((1, len(api.class_names)))
        scores[0, 2] = 1
        return scores


# ---------------- predictions ---------------------
# test predict route
def test_predict_route(client, monkeypatch):
    monkeypatch.setattr(api, "model", FakeModel())
    response = client.post("/predict", content_type="multipart/form-data", data={
        "image": (black_jpeg(), "test.jpg")
    })
    assert response.status_code == 200
    assert response.get_json()["animal"]["species"] == api.class_names[2]


# test missing image
def test_predict_without_image(client):
    response = client.post("/predict", content_type="multipart/form-data", data={})
    assert response.status_code == 400


# test the real model, when Git LFS has fetched it
MODEL = os.path.join(os.path.dirname(api.__file__), "model.keras")
@pytest.mark.skipif(os.path.getsize(MODEL) < 1_000_000, reason="model.keras is a Git LFS pointer: git lfs pull")
def test_predict_real_model(client):
    pytest.importorskip("tensorflow")
    response = client.post("/predict", content_type="multipart/form-data", data={
        "image": (black_jpeg(), "test.jpg")
    })
    assert response.status_code == 200
    assert response.get_json()["animal"]["species"] in api.class_names


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
    assert [t["animal_sp"] for t in client.get("/tracks").get_json()] == ["Chat"]


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
    assert response.get_json() == []


# ---------------- animals ---------------------
# get all animals: one card for each class the model can answer
def test_get_animals(client):
    response = client.get("/animals")
    assert response.status_code == 200
    assert sorted(a["species"] for a in response.get_json()) == sorted(api.class_names)
