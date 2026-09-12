from functools import lru_cache
from pathlib import Path

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


@lru_cache
def get_settings() -> Settings:
    return Settings()
