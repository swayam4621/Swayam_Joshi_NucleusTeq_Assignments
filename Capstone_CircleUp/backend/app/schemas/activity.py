from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ActivityBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: str = Field(..., max_length=100)
    location: str = Field(..., max_length=200)
    date: datetime
    max_participants: int = Field(..., gt=0)

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    category: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=200)
    date: Optional[datetime] = None
    max_participants: Optional[int] = Field(None, gt=0)

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