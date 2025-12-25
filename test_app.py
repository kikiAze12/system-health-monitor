import os
import base64
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint_unauthorized(client):
    """Test if the health endpoint returns 401 when unauthorized."""
    response = client.get('/health')
    assert response.status_code == 401

def test_health_endpoint_authorized(client):
    """Test if the health endpoint returns a valid response when authorized."""
    # Default credentials from app.py or .env
    user = os.getenv('BASIC_AUTH_USERNAME', 'admin')
    password = os.getenv('BASIC_AUTH_PASSWORD', 'password')
    valid_auth = base64.b64encode(f"{user}:{password}".encode('utf-8')).decode('utf-8')
    response = client.get('/health', headers={'Authorization': f'Basic {valid_auth}'})
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'cpu' in json_data
    assert 'memory' in json_data
    assert 'disk' in json_data
def test_home_page(client):
    """Test if the home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"SYSTEM OVERRIDE v2.0" in response.data
