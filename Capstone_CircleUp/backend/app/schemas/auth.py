from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@gmail\.com$")
    password: str = Field(..., min_length=8)
    phone_number: str = Field(..., pattern=r"^\d{10}$", description="Phone number must be exactly 10 digits.")
    city: str = Field(..., pattern="^(Mumbai|Pune|Bangalore|Delhi|Indore|Ahmedabad|Hyderabad|Gurgaon)$")
    bio: Optional[str] = None

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r"[a-z]", v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r"[^a-zA-Z0-9]", v):
            raise ValueError('Password must contain at least one special character')
        return v

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserPublic(BaseModel):
    id: int
    name: str
    email: str
    phone_number: Optional[str] = None
    city: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True