from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    phone_number = Column(String(30), nullable=True)
    city = Column(String(120), nullable=True)
    bio = Column(String(500), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    activities_created = relationship(
        "Activity", back_populates="creator", cascade="all, delete-orphan"
    )
    participation_requests = relationship(
        "ParticipationRequest", back_populates="requester", cascade="all, delete-orphan"
    )