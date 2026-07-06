"""
made separate from routes so ownership validation are directly unit-testable
"""
from __future__ import annotations
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.activity import Activity, ActivityStatus
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityUpdate


class ActivityNotFoundError(Exception):
    pass


class NotActivityOwnerError(Exception):
    pass


class ActivityAlreadyCancelledError(Exception):
    pass


def _apply_lazy_status(activity: Activity) -> Activity:
    """
    once date/time has passed, status auto-transitions to
    Computed that applies to open full  Cancelled stays
    """
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
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def get_activity(db: Session, activity_id: int) -> Activity:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity is None:
        raise ActivityNotFoundError(f"Activity {activity_id} not found.")
    return _apply_lazy_status(activity)


def _get_owned_activity(db: Session, activity_id: int, user: User) -> Activity:
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
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

    db.commit()
    db.refresh(activity)
    return _apply_lazy_status(activity)


def cancel_activity(db: Session, activity_id: int, user: User) -> Activity:
    activity = _get_owned_activity(db, activity_id, user)

    if activity.status == ActivityStatus.CANCELLED:
        raise ActivityAlreadyCancelledError("Activity is already cancelled.")

    activity.status = ActivityStatus.CANCELLED
    db.commit()
    db.refresh(activity)
    return activity


def list_activities(
    db: Session,
    category: str | None = None,
    location: str | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    sort_by_date: str = "asc",
) -> list[Activity]:
    """Browse/filter activities (spec section 5). Filters combine with AND."""
    query = db.query(Activity)

    if category:
        query = query.filter(Activity.category == category)
    if location:
        query = query.filter(Activity.location == location)
    if date_from:
        query = query.filter(Activity.date >= date_from)
    if date_to:
        query = query.filter(Activity.date <= date_to)

    if sort_by_date == "desc":
        query = query.order_by(Activity.date.desc())
    else:
        query = query.order_by(Activity.date.asc())

    activities = query.all()
    return [_apply_lazy_status(a) for a in activities]