from functools import lru_cache
from pathlib import Path

from fastapi import Request
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # No default on purpose: an insecure hardcoded fallback would make every
    # JWT forgeable if a deployment forgets to set this. Startup must fail
    # instead of silently issuing forgeable tokens.
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days

    database_path: Path = BACKEND_DIR / "data" / "prelegal.db"
    static_dir: Path = BACKEND_DIR / "static"

    openrouter_api_key: str | None = None

    @field_validator("jwt_secret_key")
    @classmethod
    def jwt_secret_key_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError(
                "JWT_SECRET_KEY must be set to a non-empty value "
                "(generate one with: python3 -c \"import secrets; print(secrets.token_hex(32))\")"
            )
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()


def get_request_settings(request: Request) -> Settings:
    """The Settings this app was actually constructed with (see create_app), as
    opposed to get_settings()'s process-wide default. Route handlers and
    dependencies must use this so tests (and any other caller of create_app
    with custom settings) aren't silently overridden by ambient env/.env
    state."""
    return request.app.state.settings
