"""Regression test: JWT signing/verification must use the Settings a given
app instance was constructed with, not a process-wide cached default. If
security.py (or deps.py/routers) ever goes back to reading a module-level
settings singleton instead of request.app.state.settings, a cookie issued by
one app would incorrectly validate against another app's secret."""

from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def _make_client(tmp_path, jwt_secret_key: str) -> TestClient:
    settings = Settings(
        jwt_secret_key=jwt_secret_key,
        database_path=tmp_path / f"{jwt_secret_key}.db",
        static_dir=tmp_path / "nonexistent-static",
    )
    app = create_app(settings)
    return TestClient(app)


def test_cookie_from_one_app_is_rejected_by_an_app_with_a_different_secret(tmp_path) -> None:
    with _make_client(tmp_path, "first-app-secret-key-01234567890123") as client_a:
        signup = client_a.post(
            "/api/auth/signup", json={"email": "user@example.com", "password": "correct-horse-battery"}
        )
        assert signup.status_code == 201
        stolen_cookie = signup.cookies["access_token"]

    with _make_client(tmp_path, "second-app-secret-key-98765432109876") as client_b:
        client_b.cookies.set("access_token", stolen_cookie)
        response = client_b.get("/api/auth/me")

    assert response.status_code == 401
