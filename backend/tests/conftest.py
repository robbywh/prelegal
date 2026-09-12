from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture()
def client(tmp_path: Path) -> TestClient:
    settings = Settings(
        jwt_secret_key="test-secret-key-for-tests-only",
        database_path=tmp_path / "test.db",
        static_dir=tmp_path / "nonexistent-static",
    )
    app = create_app(settings)
    with TestClient(app) as test_client:
        yield test_client
