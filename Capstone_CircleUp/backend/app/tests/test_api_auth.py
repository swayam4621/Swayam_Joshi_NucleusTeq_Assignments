from fastapi.testclient import TestClient

from app.main import app
from app.db.session import get_db


def test_protected_endpoint_requires_authentication(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(app)

    try:
        response = client.get("/users/me")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 401


def test_protected_endpoint_rejects_invalid_token(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(app)

    try:
        response = client.get(
            "/users/me",
            headers={"Authorization": "Bearer not-a-real-token"},
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 401
