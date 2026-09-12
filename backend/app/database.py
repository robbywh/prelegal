from collections.abc import Generator

from fastapi import Request
from sqlalchemy import Engine
from sqlmodel import Session, SQLModel, create_engine

from app.config import Settings


def create_db_engine(settings: Settings) -> Engine:
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(
        f"sqlite:///{settings.database_path}", connect_args={"check_same_thread": False}
    )


def init_db(engine: Engine, settings: Settings) -> None:
    """(Re)create the database from scratch so each container start is clean."""
    if settings.database_path.exists():
        settings.database_path.unlink()
    SQLModel.metadata.create_all(engine)


def get_session(request: Request) -> Generator[Session, None, None]:
    with Session(request.app.state.engine) as session:
        yield session
