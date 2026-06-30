"""
create, view detail, browse/filter, edit, cancel.
Edit/cancel require ownership enforced in activity_service.py, mapped
to 403 here nd never a 500
"""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional
from app.db.session import get_db
from app.models.activity import Activity
from app.models.activity_participation import ParticipationStatus
from app.models.user import User
from app.schemas.activity import (
    ActivityCreate,
    ActivityDetailOut,
    ActivityOut,
    ActivityUpdate,
    RequestSummary,
)
from app.services.activity_service import (
    ActivityAlreadyCancelledError,
    ActivityNotFoundError,
    NotActivityOwnerError,
    create_activity,
    get_activity,
    list_activities,
    update_activity,
    cancel_activity,
)
from app.services.participation_service import (
    ActivityNotAcceptingRequestsError,
    DuplicateParticipationRequestError,
    NotParticipationOwnerError,
    ParticipationNotAllowedError,
    ParticipationRequestNotFoundError,
    ParticipationRequestStatusError,
    create_participation_request,
    approve_participation_request,
    reject_participation_request,
    get_activity_requests,
    count_activity_requests,
    get_user_participation_status,
)

router = APIRouter(prefix="/activities", tags=["activities"])


def _activity_to_dict(activity: Activity, current_user: User | None, db: Session) -> dict:
    is_owner = current_user is not None and current_user.id == activity.creator_id
    user_status = None
    contact_phone = None

    if current_user is not None:
        user_status = get_user_participation_status(db, activity.id, current_user)
        if is_owner or user_status == ParticipationStatus.APPROVED:
            contact_phone = activity.creator.phone_number

    approved_count = count_activity_requests(db, activity.id, ParticipationStatus.APPROVED)
    pending_count = count_activity_requests(db, activity.id, ParticipationStatus.PENDING)

    return {
        "id": activity.id,
        "creator_id": activity.creator_id,
        "title": activity.title,
        "description": activity.description,
        "category": activity.category,
        "location": activity.location,
        "date": activity.date,
        "max_participants": activity.max_participants,
        "status": activity.status,
        "approved_count": approved_count,
        "pending_request_count": pending_count,
        "user_request_status": user_status,
        "is_owner": is_owner,
        "contact_phone": contact_phone,
        "created_at": activity.created_at,
    }


def _activity_detail_to_dict(activity: Activity, current_user: User | None, db: Session) -> dict:
    detail = _activity_to_dict(activity, current_user, db)
    detail["organizer_phone"] = None
    if current_user is not None:
        if current_user.id == activity.creator_id:
            detail["organizer_phone"] = activity.creator.phone_number
        elif detail["user_request_status"] == ParticipationStatus.APPROVED:
            detail["organizer_phone"] = activity.creator.phone_number

    pending_requests = []
    if current_user is not None and current_user.id == activity.creator_id:
        pending_requests = get_activity_requests(db, activity.id)

    detail["pending_requests"] = pending_requests
    return detail


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
    current_user: User | None = Depends(get_current_user_optional),
):
    activities = list_activities(
        db, category=category, location=location,
        date_from=date_from, date_to=date_to, sort_by_date=sort,
    )
    return [_activity_to_dict(activity, current_user, db) for activity in activities]


@router.get("/{activity_id}", response_model=ActivityDetailOut)
def get_detail(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    try:
        activity = get_activity(db, activity_id)
        return _activity_detail_to_dict(activity, current_user, db)
    except ActivityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/{activity_id}/requests", response_model=RequestSummary, status_code=status.HTTP_201_CREATED)
def request_participation(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        request = create_participation_request(db, activity_id, current_user)
        return {
            "id": request.id,
            "requester_id": request.requester.id,
            "requester_name": request.requester.name,
            "requester_phone": request.requester.phone_number,
            "status": request.status,
            "created_at": request.created_at,
        }
    except ActivityNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except DuplicateParticipationRequestError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except ParticipationNotAllowedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ActivityNotAcceptingRequestsError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/{activity_id}/requests", response_model=list[RequestSummary])
def list_participation_requests(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Activity {activity_id} not found.")
    if activity.creator_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the activity creator can view participation requests.")
    return get_activity_requests(db, activity_id)


@router.post("/requests/{request_id}/approve", response_model=RequestSummary)
def approve_participation_request_route(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        request = approve_participation_request(db, request_id, current_user)
        return {
            "id": request.id,
            "requester_id": request.requester.id,
            "requester_name": request.requester.name,
            "requester_phone": request.requester.phone_number,
            "status": request.status,
            "created_at": request.created_at,
        }
    except ParticipationRequestNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NotParticipationOwnerError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ParticipationRequestStatusError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except ActivityNotAcceptingRequestsError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/requests/{request_id}/reject", response_model=RequestSummary)
def reject_participation_request_route(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        request = reject_participation_request(db, request_id, current_user)
        return {
            "id": request.id,
            "requester_id": request.requester.id,
            "requester_name": request.requester.name,
            "requester_phone": request.requester.phone_number,
            "status": request.status,
            "created_at": request.created_at,
        }
    except ParticipationRequestNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except NotParticipationOwnerError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ParticipationRequestStatusError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
