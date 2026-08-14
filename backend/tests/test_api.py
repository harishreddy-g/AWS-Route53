import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("SEED_DEFAULT_USER", "false")

import app.models  # noqa: F401
from app.core.security import hash_password, utc_now
from app.database import Base, get_db
from app.main import app
from app.models.user import User

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture()
def user_a(db_session):
    user = User(email="a@example.com", password_hash=hash_password("password123"), created_at=utc_now())
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture()
def user_b(db_session):
    user = User(email="b@example.com", password_hash=hash_password("password123"), created_at=utc_now())
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


def auth_headers(client: TestClient, email: str, password: str = "password123") -> dict[str, str]:
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_login_and_me(client, user_a):
    headers = auth_headers(client, user_a.email)
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["data"]["email"] == user_a.email


def test_foreign_zone_returns_404(client, user_a, user_b):
    headers_a = auth_headers(client, user_a.email)
    create_response = client.post(
        "/api/hosted-zones",
        json={"name": "example.com", "zone_type": "public"},
        headers=headers_a,
    )
    zone_id = create_response.json()["id"]

    headers_b = auth_headers(client, user_b.email)
    response = client.get(f"/api/hosted-zones/{zone_id}", headers=headers_b)
    assert response.status_code == 404


def test_duplicate_zone_name_conflict(client, user_a):
    headers = auth_headers(client, user_a.email)
    payload = {"name": "duplicate.com", "zone_type": "public"}

    first = client.post("/api/hosted-zones", json=payload, headers=headers)
    second = client.post("/api/hosted-zones", json=payload, headers=headers)

    assert first.status_code == 201
    assert second.status_code == 409


def test_invalid_a_record_rejected(client, user_a):
    headers = auth_headers(client, user_a.email)
    zone = client.post("/api/hosted-zones", json={"name": "zone.com", "zone_type": "public"}, headers=headers).json()

    response = client.post(
        f"/api/hosted-zones/{zone['id']}/records",
        json={"name": "zone.com", "type": "A", "value": "not-an-ip", "ttl": 300},
        headers=headers,
    )
    assert response.status_code == 400


def test_logout_revokes_current_session_only(client, user_a):
    login_one = client.post("/api/auth/login", json={"email": user_a.email, "password": "password123"})
    login_two = client.post("/api/auth/login", json={"email": user_a.email, "password": "password123"})

    token_one = login_one.json()["access_token"]
    token_two = login_two.json()["access_token"]

    logout = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token_one}"})
    assert logout.status_code == 200

    still_valid = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_two}"})
    assert still_valid.status_code == 200

    revoked = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token_one}"})
    assert revoked.status_code == 401
