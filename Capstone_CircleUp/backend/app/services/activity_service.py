"""
made separate from routes so ownership validation are directly unit-testable
"""
from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.activity import Activity, ActivityStatus
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.repositories import activity_repository
from app.services.participation_service import get_user_participation_status, ParticipationStatus

class ActivityNotFoundError(Exception): pass
class NotActivityOwnerError(Exception): pass
class ActivityAlreadyCancelledError(Exception): pass


def _apply_lazy_status(activity: Activity) -> Activity:
    if activity.status in (ActivityStatus.OPEN, ActivityStatus.FULL):
        activity_date = activity.date
        if activity_date.tzinfo is None:
            activity_date = activity_date.replace(tzinfo=timezone.utc)
        if activity_date < datetime.now(timezone.utc):
            activity.status = ActivityStatus.COMPLETED
    return activity


def create_activity(db: Session, creator: User, data: ActivityCreate) -> Activity:
    activity = Activity(
        creator_id=creator.id,
        title=data.title,
        description=data.description,
        category=data.category,
        location=data.location,
        date=data.date,
        max_participants=data.max_participants,
        status=ActivityStatus.OPEN,
    )
    return activity_repository.create(db, activity)


def get_activity(db: Session, activity_id: int, current_user: User | None = None) -> Activity:
    activity = activity_repository.get_by_id(db, activity_id)
    if activity is None:
        raise ActivityNotFoundError(f"Activity {activity_id} not found.")
    
    activity = _apply_lazy_status(activity)
    activity.contact_phone = None

    if current_user:
        if activity.creator_id == current_user.id:
            activity.contact_phone = activity.creator.phone_number
        else:
            status = get_user_participation_status(db, activity.id, current_user)
            if status == ParticipationStatus.APPROVED:
                activity.contact_phone = activity.creator.phone_number

    return activity


def _get_owned_activity(db: Session, activity_id: int, user: User) -> Activity:
    activity = activity_repository.get_by_id(db, activity_id)
    if activity is None:
        raise ActivityNotFoundError(f"Activity {activity_id} not found.")
    if activity.creator_id != user.id:
        raise NotActivityOwnerError("Only the activity creator can perform this action.")
    return activity


def update_activity(db: Session, activity_id: int, user: User, data: ActivityUpdate) -> Activity:
    activity = _get_owned_activity(db, activity_id, user)

    if activity.status == ActivityStatus.CANCELLED:
        raise ActivityAlreadyCancelledError("Cannot edit a cancelled activity.")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(activity, field, value)

    activity = activity_repository.save(db, activity)
    return _apply_lazy_status(activity)


def cancel_activity(db: Session, activity_id: int, user: User) -> Activity:
    activity = _get_owned_activity(db, activity_id, user)

    if activity.status == ActivityStatus.CANCELLED:
        raise ActivityAlreadyCancelledError("Activity is already cancelled.")

    activity.status = ActivityStatus.CANCELLED
    return activity_repository.save(db, activity)


def list_activities(
    db: Session,
    category: str | None = None,
    location: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    sort_by_date: str = "asc",
    current_user: User | None = None,
) -> list[Activity]:
    
    activities = activity_repository.list_all(
        db, category=category, location=location, 
        date_from=date_from, date_to=date_to, sort_by_date=sort_by_date
    )

    for activity in activities:
        _apply_lazy_status(activity)
        activity.contact_phone = None
        
        if current_user:
            if activity.creator_id == current_user.id:
                activity.contact_phone = activity.creator.phone_number
            else:
                status = get_user_participation_status(db, activity.id, current_user)
                if status == ParticipationStatus.APPROVED:
                    activity.contact_phone = activity.creator.phone_number

    return activities