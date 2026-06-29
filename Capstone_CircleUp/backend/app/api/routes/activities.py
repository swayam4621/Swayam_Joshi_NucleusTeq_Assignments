"""
create, view detail, browse/filter, edit, cancel.
Edit/cancel require ownership enforced in activity_service.py, mapped
to 403 here nd never a 500
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityOut, ActivityUpdate
from app.services.activity_service import (
    create_activity,
    get_activity,
    update_activity,
    cancel_activity,
    list_activities,
    ActivityNotFoundError,
    NotActivityOwnerError,
    ActivityAlreadyCancelledError,
)

router = APIRouter(prefix="/activities", tags=["activities"])


@router.post("", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def create(
    payload: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_activity(db, current_user, payload)


@router.get("", response_model=list[ActivityOut])
def browse(
    category: str | None = Query(None),
    location: str | None = Query(None),
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    sort: str = Query("asc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
):
    return list_activities(
        db, category=category, location=location,
        date_from=date_from, date_to=date_to, sort_by_date=sort,
    )


@router.get("/{activity_id}", response_model=ActivityOut)
def get_detail(activity_id: int, db: Session = Depends(get_db)):
    try:
        return get_activity(db, activity_id)
    except ActivityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch("/{activity_id}", response_model=ActivityOut)
def edit(
    activity_id: int,
    payload: ActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return update_activity(db, activity_id, current_user, payload)
    except ActivityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NotActivityOwnerError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ActivityAlreadyCancelledError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/{activity_id}/cancel", response_model=ActivityOut)
def cancel(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        return cancel_activity(db, activity_id, current_user)
    except ActivityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NotActivityOwnerError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ActivityAlreadyCancelledError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))