from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.activity_participation import ParticipationRequest, ParticipationStatus

def get_by_id(db: Session, request_id: int) -> ParticipationRequest | None:
    return db.query(ParticipationRequest).filter(ParticipationRequest.id == request_id).first()

def get_by_user_and_activity(db: Session, user_id: int, activity_id: int) -> list[ParticipationRequest]:
    return db.query(ParticipationRequest).filter(
        ParticipationRequest.activity_id == activity_id,
        ParticipationRequest.requester_id == user_id
    ).all()

def list_by_activity(db: Session, activity_id: int) -> list[ParticipationRequest]:
    return db.query(ParticipationRequest).filter(
        ParticipationRequest.activity_id == activity_id
    ).order_by(ParticipationRequest.created_at.asc()).all()

def count_by_status(db: Session, activity_id: int, status: ParticipationStatus) -> int:
    result = db.execute(
        select(func.sum(ParticipationRequest.participant_count)).where(
            ParticipationRequest.activity_id == activity_id,
            ParticipationRequest.status == status
        )
    ).scalar_one_or_none()
    return result or 0

def create(db: Session, request: ParticipationRequest) -> ParticipationRequest:
    db.add(request)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(request)
    return request