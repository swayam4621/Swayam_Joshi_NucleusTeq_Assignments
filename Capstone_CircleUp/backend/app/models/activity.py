"""
Activity model.
Schema defined fully here (spec sections 4 + 7). Business logic (status
transitions, capacity, ownership) lives in app/services/activity_service.py,
not here.
"""
import enum

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class ActivityStatus(str, enum.Enum):
    OPEN = "open"
    FULL = "full"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(200), nullable=False)
    description = Column(String(2000), nullable=True)
    category = Column(String(100), nullable=False, index=True)
    location = Column(String(200), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)
    max_participants = Column(Integer, nullable=False)

    status = Column(
        Enum(ActivityStatus), nullable=False, default=ActivityStatus.OPEN, index=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="activities_created")
    participation_requests = relationship(
        "ParticipationRequest", back_populates="activity", cascade="all, delete-orphan"
    )