import pytest
from pydantic import ValidationError

from app.config import Settings


def test_settings_require_jwt_secret_key(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    monkeypatch.delenv("JWT_SECRET_KEY", raising=False)

    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_path=tmp_path / "test.db")


@pytest.mark.parametrize("blank_value", ["", "   "])
def test_settings_reject_blank_jwt_secret_key(blank_value: str, tmp_path) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, jwt_secret_key=blank_value, database_path=tmp_path / "test.db")
