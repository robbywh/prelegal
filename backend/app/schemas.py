from pydantic import BaseModel, EmailStr, field_validator


def _normalize_email(value: str) -> str:
    return value.strip().lower()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str

    _normalize_email = field_validator("email")(_normalize_email)

    @field_validator("password")
    @classmethod
    def password_length(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("password must be at least 8 characters long")
        if len(value.encode("utf-8")) > 72:
            raise ValueError("password must be at most 72 bytes long")
        return value


class SigninRequest(BaseModel):
    email: EmailStr
    password: str

    _normalize_email = field_validator("email")(_normalize_email)


class UserOut(BaseModel):
    id: int
    email: str
