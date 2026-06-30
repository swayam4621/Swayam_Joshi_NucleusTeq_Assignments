from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone_number: str | None = None
    city: str | None = None
    bio: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserPublic(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone_number: str | None = None
    city: str | None = None
    bio: str | None = None

    model_config = ConfigDict(from_attributes=True)