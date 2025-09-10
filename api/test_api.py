import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_predict_route(client):
    # Image simulée : 256x256x3 pixels
    dummy_image = [[[0.0 for _ in range(3)] for _ in range(256)] for _ in range(256)]

    response = client.post('/predict', json={"image": dummy_image})
    assert response.status_code == 200

    data = response.get_json()
    assert "prediction" in data
    assert isinstance(data["prediction"], str)
