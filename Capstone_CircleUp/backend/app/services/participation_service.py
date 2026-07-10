from __future__ import annotations
from datetime import datetime, timezone
import logging

from sqlalchemy.orm import Session

from app.models.activity import Activity, ActivityStatus
from app.models.activity_participation import ParticipationRequest, ParticipationStatus
from app.models.user import User
from app.services.activity_service import ActivityNotFoundError
from app.repositories import activity_repository, participation_repository

logger = logging.getLogger("circleup")

class ParticipationError(Exception): pass
class ParticipationNotAllowedError(ParticipationError): pass
class ActivityNotAcceptingRequestsError(ParticipationError): pass
class ParticipationRequestNotFoundError(ParticipationError): pass
class ParticipationRequestStatusError(ParticipationError): pass
class NotParticipationOwnerError(ParticipationError): pass
class DuplicateParticipationRequestError(ParticipationError): pass


def _normalize_status(activity: Activity) -> ActivityStatus:
    if activity.status in (ActivityStatus.OPEN, ActivityStatus.FULL):
        activity_date = activity.date
        if activity_date.tzinfo is None:
            activity_date = activity_date.replace(tzinfo=timezone.utc)
        if activity_date < datetime.now(timezone.utc):
            return ActivityStatus.COMPLETED
    return activity.status


def _assert_activity_active(activity: Activity, requester: User | None = None) -> None:
    current_status = _normalize_status(activity)
    if current_status == ActivityStatus.CANCELLED:
        raise ActivityNotAcceptingRequestsError("Cancelled activities cannot accept participation requests.")
    if current_status == ActivityStatus.COMPLETED:
        raise ActivityNotAcceptingRequestsError("Completed activities cannot accept participation requests.")
    if current_status == ActivityStatus.FULL:
        raise ActivityNotAcceptingRequestsError("This activity is already full.")
    if requester and activity.creator_id == requester.id:
        raise ParticipationNotAllowedError("You cannot request participation in your own activity.")


def count_activity_requests(db: Session, activity_id: int, status: ParticipationStatus) -> int:
    return participation_repository.count_by_status(db, activity_id, status)


def get_user_participation_status(db: Session, activity_id: int, user: User) -> ParticipationStatus | None:
    requests = participation_repository.get_by_user_and_activity(db, user.id, activity_id)
    
    if not requests:
        return None        
    
    for req in requests:
        if req.status == ParticipationStatus.APPROVED:
            return ParticipationStatus.APPROVED
            
    for req in requests:
        if req.status == ParticipationStatus.PENDING:
            return ParticipationStatus.PENDING
        
    return requests[0].status


def create_participation_request(db: Session, activity_id: int, requester: User, participant_count: int) -> ParticipationRequest:
    activity = activity_repository.get_by_id(db, activity_id)
    if activity is None:
        raise ActivityNotFoundError(f"Activity {activity_id} not found.")

    _assert_activity_active(activity, requester=requester)

    existing_requests = participation_repository.get_by_user_and_activity(db, requester.id, activity_id)
    if existing_requests:
        raise DuplicateParticipationRequestError("You've already requested to join this activity.")

    request = ParticipationRequest(
        activity_id=activity_id, 
        requester_id=requester.id,
        participant_count=participant_count
    )
    return participation_repository.create(db, request)


def _lock_activity(db: Session, activity_id: int) -> Activity:
    activity = activity_repository.get_by_id(db, activity_id, lock=True)
    if activity is None:
        raise ActivityNotFoundError(f"Activity {activity_id} not found.")
    return activity


def approve_participation_request(db: Session, request_id: int, owner: User) -> ParticipationRequest:
    request = participation_repository.get_by_id(db, request_id)
    if request is None:
        raise ParticipationRequestNotFoundError(f"Participation request {request_id} not found.")

    activity = _lock_activity(db, request.activity_id)
    if activity.creator_id != owner.id:
        logger.warning("User %s attempted to approve request %s on activity %s they do not own.", owner.id, request_id, activity.id)
        raise NotParticipationOwnerError("Only the activity creator can approve requests.")

    current_status = _normalize_status(activity)
    if current_status in (ActivityStatus.CANCELLED, ActivityStatus.COMPLETED):
        raise ActivityNotAcceptingRequestsError("Cannot approve requests for cancelled or completed activities.")

    if request.status != ParticipationStatus.PENDING:
        raise ParticipationRequestStatusError("Only pending requests can be approved.")

    approved_count = count_activity_requests(db, activity.id, ParticipationStatus.APPROVED)

    if approved_count + request.participant_count > activity.max_participants:
        raise ActivityNotAcceptingRequestsError("Approving this request would exceed the activity's maximum capacity.")

    request.status = ParticipationStatus.APPROVED
    
    if approved_count + request.participant_count >= activity.max_participants:
        activity.status = ActivityStatus.FULL
        activity_repository.save(db, activity) # Persist the status change

    logger.info("Request %s (requester %s) approved for activity %s by owner %s.", request.id, request.requester_id, activity.id, owner.id)
    return participation_repository.save(db, request)


def reject_participation_request(db: Session, request_id: int, owner: User) -> ParticipationRequest:
    request = participation_repository.get_by_id(db, request_id)
    if request is None:
        raise ParticipationRequestNotFoundError(f"Participation request {request_id} not found.")

    activity = activity_repository.get_by_id(db, request.activity_id)
    if activity is None:
        raise ActivityNotFoundError(f"Activity {request.activity_id} not found.")
    if activity.creator_id != owner.id:
        logger.warning("User %s attempted to reject request %s on activity %s they do not own.", owner.id, request_id, activity.id)
        raise NotParticipationOwnerError("Only the activity creator can reject requests.")

    if request.status != ParticipationStatus.PENDING:
        raise ParticipationRequestStatusError("Only pending requests can be rejected.")

    request.status = ParticipationStatus.REJECTED
    logger.info("Request %s (requester %s) rejected for activity %s by owner %s.", request.id, request.requester_id, activity.id, owner.id)
    return participation_repository.save(db, request)


def get_activity_requests(db: Session, activity_id: int) -> list[dict]:
    requests = participation_repository.list_by_activity(db, activity_id)

    results: list[dict] = []
    for request in requests:
        requester = request.requester
        results.append(
            {
                "id": request.id,
                "requester_id": requester.id,
                "requester_name": requester.name,
                "requester_phone": requester.phone_number,
                "status": request.status,
                "participant_count": request.participant_count,
                "created_at": request.created_at,
            }
        )

    return results