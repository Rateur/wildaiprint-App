import pytest
from api.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_predict_route(client):
    dummy_image = [[[0.0 for _ in range(3)] for _ in range(256)] for _ in range(256)]

    payload = {
        "image": dummy_image,
        "path": "trace_001.jpg",
        "loc": "Lyon",
        "date": "2025-09-10"
    }

    response = client.post('/predict', json=payload)
    assert response.status_code == 200

    data = response.get_json()
    assert "species" in data or "prediction" in data  
