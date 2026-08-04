from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
import re

class RegisterRequest(BaseModel):
    name: str = Field(..., max_length=120)
    email: str
    password: str = Field(..., min_length=8)
    phone_number: str
    city: str
    bio: Optional[str] = None

    @field_validator('name')
    @classmethod
    def validate_name_length(cls, v: str) -> str:
        if len(v.strip()) < 3:
            raise ValueError('Name must be at least 3 characters long.')
        return v.strip()

    @field_validator('email')
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_.+-]+@gmail\.com$", v):
            raise ValueError('Email must be a valid @gmail.com address.')
        return v

    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v: str) -> str:
        if not re.match(r"^\d{10}$", v):
            raise ValueError('Phone number must be exactly 10 digits.')
        return v

    @field_validator('city')
    @classmethod
    def validate_city(cls, v: str) -> str:
        allowed_cities = {"Mumbai", "Pune", "Bangalore", "Delhi", "Indore", "Ahmedabad", "Hyderabad", "Gurgaon"}
        if v not in allowed_cities:
            raise ValueError('Please select a valid city.')
        return v

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