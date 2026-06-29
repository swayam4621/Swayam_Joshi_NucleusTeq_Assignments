"""
max_participants > 0
date must be in the future 
"""
from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.activity import ActivityStatus


def _ensure_future(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    if value <= datetime.now(timezone.utc):
        raise ValueError("Activity date/time must be in the future.")
    return value


class ActivityCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    category: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    date: datetime
    max_participants: int = Field(..., gt=0)

    @field_validator("date")
    @classmethod
    def date_must_be_future(cls, value: datetime) -> datetime:
        return _ensure_future(value)


class ActivityUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    category: str | None = Field(None, min_length=1, max_length=100)
    location: str | None = Field(None, min_length=1, max_length=200)
    date: datetime | None = None
    max_participants: int | None = Field(None, gt=0)

    @field_validator("date")
    @classmethod
    def date_must_be_future(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return value
        return _ensure_future(value)


class ActivityOut(BaseModel):
    id: int
    creator_id: int
    title: str
    description: str | None
    category: str
    location: str
    date: datetime
    max_participants: int
    status: ActivityStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)