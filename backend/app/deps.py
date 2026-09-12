from fastapi import Cookie, Depends, HTTPException, status
from sqlmodel import Session

from app.config import Settings, get_request_settings
from app.database import get_session
from app.models import User
from app.security import ACCESS_TOKEN_COOKIE_NAME, decode_access_token


def get_current_user(
    access_token: str | None = Cookie(default=None, alias=ACCESS_TOKEN_COOKIE_NAME),
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_request_settings),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
    )
    if access_token is None:
        raise unauthorized

    user_id = decode_access_token(access_token, settings)
    if user_id is None:
        raise unauthorized

    user = session.get(User, user_id)
    if user is None:
        raise unauthorized

    return user
