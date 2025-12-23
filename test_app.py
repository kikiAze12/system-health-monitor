import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    """Test if the health endpoint returns a valid response."""
    response = client.get('/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'cpu' in json_data
    assert 'memory' in json_data
    assert 'disk' in json_data

def test_home_page(client):
    """Test if the home page loads successfully."""
    response = client.get('/')
    assert response.status_code == 200
    assert b"System Health Status" in response.data
