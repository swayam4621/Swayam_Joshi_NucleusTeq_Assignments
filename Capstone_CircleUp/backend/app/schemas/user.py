from pydantic import BaseModel, Field


class UserProfileUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=120)
    phone_number: str | None = None
    city: str | None = None
    bio: str | None = None