import api.test_api as test_api
from app import app

@test_api.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_predict_route(client):
    # Example of simulated image (256x256x3) with values between 0 and 1
    dummy_image = [[[0.0]*3]*256]*256  # black image

    response = client.post('/predict', json={"image": dummy_image})
    assert response.status_code == 200

    data = response.get_json()
    assert "prediction" in data
    assert isinstance(data["prediction"], str)