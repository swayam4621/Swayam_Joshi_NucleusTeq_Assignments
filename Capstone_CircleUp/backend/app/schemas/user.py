from pydantic import BaseModel, Field

class UserProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    phone_number: str | None = Field(None, pattern=r'^\d{10}$', description="Phone number must be exactly 10 digits.")
    city: str | None = None
    bio: str | None = None