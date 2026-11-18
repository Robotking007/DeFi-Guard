def test_read_root(client):
    """Test the root welcome endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DeFiGuard API"
    assert data["status"] == "online"
    assert data["docs"] == "/docs"


def test_top_level_health(client):
    """Test top-level /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "version" in data
    assert "environment" in data
    assert "timestamp" in data
    assert "database_connected" in data


def test_api_v1_health(client):
    """Test API v1 /api/v1/health endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert data["version"] == "1.0.0"
    assert data["database_connected"] is True
