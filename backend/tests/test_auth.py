from fastapi.testclient import TestClient

EMAIL = "user@example.com"
PASSWORD = "correct-horse-battery-staple"


def test_signup_creates_user_and_sets_cookie(client: TestClient) -> None:
    response = client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == EMAIL
    assert "id" in body
    assert "access_token" in response.cookies


def test_signup_rejects_duplicate_email(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})
    response = client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    assert response.status_code == 400


def test_signup_rejects_short_password(client: TestClient) -> None:
    response = client.post("/api/auth/signup", json={"email": EMAIL, "password": "short"})

    assert response.status_code == 422


def test_signin_with_correct_credentials(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    response = client.post("/api/auth/signin", json={"email": EMAIL, "password": PASSWORD})

    assert response.status_code == 200
    assert response.json()["email"] == EMAIL
    assert "access_token" in response.cookies


def test_signin_with_wrong_password(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    response = client.post("/api/auth/signin", json={"email": EMAIL, "password": "wrong-password"})

    assert response.status_code == 401


def test_signin_with_unknown_email(client: TestClient) -> None:
    response = client.post(
        "/api/auth/signin", json={"email": "nobody@example.com", "password": PASSWORD}
    )

    assert response.status_code == 401


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401


def test_me_returns_current_user_when_authenticated(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    response = client.get("/api/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == EMAIL


def test_signup_email_is_case_and_whitespace_normalized(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": "  Alice@Example.COM  ", "password": PASSWORD})

    duplicate = client.post(
        "/api/auth/signup", json={"email": "alice@example.com", "password": PASSWORD}
    )
    assert duplicate.status_code == 400

    signin_response = client.post(
        "/api/auth/signin", json={"email": "ALICE@EXAMPLE.COM", "password": PASSWORD}
    )
    assert signin_response.status_code == 200
    assert signin_response.json()["email"] == "alice@example.com"


def test_signout_clears_cookie_and_deauthenticates(client: TestClient) -> None:
    client.post("/api/auth/signup", json={"email": EMAIL, "password": PASSWORD})

    signout_response = client.post("/api/auth/signout")
    assert signout_response.status_code == 204

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 401
