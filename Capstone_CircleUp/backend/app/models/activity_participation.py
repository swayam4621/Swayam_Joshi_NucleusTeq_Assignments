"""
ParticipationRequest model — schema only (spec section 6). Approval logic
lands in the Participation Requests PR.
"""
import enum

from sqlalchemy import Column, Integer, ForeignKey, Enum, DateTime, func, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.session import Base


class ParticipationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ParticipationRequest(Base):
    __tablename__ = "participation_requests"
    __table_args__ = (
        UniqueConstraint("activity_id", "requester_id", name="uq_activity_requester"),
    )

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    status = Column(
        Enum(ParticipationStatus), nullable=False, default=ParticipationStatus.PENDING, index=True
    )

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    activity = relationship("Activity", back_populates="participation_requests")
    requester = relationship("User", back_populates="participation_requests")