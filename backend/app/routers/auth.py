from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.config import Settings, get_request_settings
from app.database import get_session
from app.deps import get_current_user
from app.models import User
from app.schemas import SigninRequest, SignupRequest, UserOut
from app.security import (
    ACCESS_TOKEN_COOKIE_NAME,
    create_access_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_auth_cookie(response: Response, user_id: int, settings: Settings) -> None:
    token = create_access_token(user_id, settings)
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=settings.jwt_expires_minutes * 60,
        path="/",
    )


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    response: Response,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_request_settings),
) -> User:
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered"
        )

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    session.add(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered"
        ) from None
    session.refresh(user)

    _set_auth_cookie(response, user.id, settings)
    return user


@router.post("/signin", response_model=UserOut)
def signin(
    payload: SigninRequest,
    response: Response,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_request_settings),
) -> User:
    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
    )

    user = session.exec(select(User).where(User.email == payload.email)).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials

    _set_auth_cookie(response, user.id, settings)
    return user


@router.post("/signout", status_code=status.HTTP_204_NO_CONTENT)
def signout(response: Response) -> None:
    response.delete_cookie(key=ACCESS_TOKEN_COOKIE_NAME, path="/")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
