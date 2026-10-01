from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_login_rejects_missing_credentials():
    response = client.post("/api/auth/login", json={})
    assert response.status_code in {400, 422}


def test_protected_endpoint_rejects_missing_token():
    response = client.get("/api/auth/me")
    assert response.status_code in {401, 403}
