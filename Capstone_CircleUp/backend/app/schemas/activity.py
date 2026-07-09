from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator


def _ensure_future(value: datetime) -> datetime:
    check_value = value
    if check_value.tzinfo is None:
        check_value = check_value.replace(tzinfo=timezone.utc)
    if check_value <= datetime.now(timezone.utc):
        raise ValueError("Activity date and time must be in the future.")
    return value


class ActivityBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(..., min_length=1, max_length=100)
    location: str = Field(..., min_length=1, max_length=200)
    date: datetime
    max_participants: int = Field(..., gt=0)

class ActivityCreate(ActivityBase):
    @field_validator("date")
    @classmethod
    def date_must_be_future(cls, v: datetime) -> datetime:
        return _ensure_future(v)


class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    date: Optional[datetime] = None
    max_participants: Optional[int] = Field(None, gt=0)

    @field_validator("date")
    @classmethod
    def date_must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        return _ensure_future(v)

class ActivityOut(ActivityBase):
    id: int
    creator_id: int
    status: str
    approved_count: int
    pending_request_count: int
    user_request_status: Optional[str]
    is_owner: bool
    contact_phone: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ParticipationRequestCreate(BaseModel):
    participant_count: int = Field(default=1, ge=1)

class RequestSummary(BaseModel):
    id: int
    requester_id: int
    requester_name: str
    requester_phone: Optional[str]
    status: str
    participant_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class ActivityDetailOut(ActivityOut):
    organizer_phone: Optional[str]
    pending_requests: List[RequestSummary] = []