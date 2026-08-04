import threading
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.orm import sessionmaker

from app.models.activity import Activity, ActivityStatus
from app.models.activity_participation import ParticipationRequest, ParticipationStatus
from app.models.user import User
from app.schemas.activity import ParticipationRequestCreate
from app.services.activity_service import ActivityNotFoundError
from app.services.participation_service import (
    ActivityNotAcceptingRequestsError,
    DuplicateParticipationRequestError,
    NotParticipationOwnerError,
    ParticipationNotAllowedError,
    ParticipationRequestStatusError,
    approve_participation_request,
    create_participation_request,
    reject_participation_request,
)


def test_create_participation_request_rejects_own_activity(db_session, make_user, make_activity):
    creator = make_user(name="Owner", email="owner@gmail.com")
    activity = make_activity(creator)

    with pytest.raises(ParticipationNotAllowedError):
        create_participation_request(db_session, activity.id, creator, 1)


def test_create_participation_request_rejects_duplicate_request(db_session, make_user, make_activity):
    creator = make_user(name="Owner", email="owner2@gmail.com")
    requester = make_user(name="Requester", email="requester@gmail.com")
    activity = make_activity(creator)

    create_participation_request(db_session, activity.id, requester, 1)

    with pytest.raises(DuplicateParticipationRequestError):
        create_participation_request(db_session, activity.id, requester, 1)


def test_create_participation_request_rejects_cancelled_activity(db_session, make_user, make_activity):
    creator = make_user(name="Owner", email="owner3@gmail.com")
    requester = make_user(name="Requester", email="requester2@gmail.com")
    activity = make_activity(creator, status=ActivityStatus.CANCELLED)

    with pytest.raises(ActivityNotAcceptingRequestsError):
        create_participation_request(db_session, activity.id, requester, 1)


def test_create_participation_request_rejects_full_activity(db_session, make_user, make_activity):
    creator = make_user(name="Owner", email="owner4@gmail.com")
    requester = make_user(name="Requester", email="requester3@gmail.com")
    activity = make_activity(creator, max_participants=1, status=ActivityStatus.FULL)

    with pytest.raises(ActivityNotAcceptingRequestsError):
        create_participation_request(db_session, activity.id, requester, 1)


def test_create_participation_request_rejects_completed_activity(db_session, make_user, make_activity):
    creator = make_user(name="Owner", email="owner5@gmail.com")
    requester = make_user(name="Requester", email="requester4@gmail.com")
    activity = make_activity(creator, date=datetime.now(timezone.utc) - timedelta(hours=1))

    with pytest.raises(ActivityNotAcceptingRequestsError):
        create_participation_request(db_session, activity.id, requester, 1)


def test_approve_participation_request_rejects_non_owner(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner6@gmail.com")
    requester = make_user(name="Requester", email="requester5@gmail.com")
    activity = make_activity(owner)
    request = create_participation_request(db_session, activity.id, requester, 1)

    with pytest.raises(NotParticipationOwnerError):
        approve_participation_request(db_session, request.id, requester)


@pytest.mark.parametrize("initial_status", [ParticipationStatus.APPROVED, ParticipationStatus.REJECTED])
def test_approve_participation_request_rejects_non_pending_requests(db_session, make_user, make_activity, initial_status):
    owner = make_user(name="Owner", email=f"owner{initial_status.value}@gmail.com")
    requester = make_user(name="Requester", email=f"requester{initial_status.value}@gmail.com")
    activity = make_activity(owner)
    request = create_participation_request(db_session, activity.id, requester, 1)
    request.status = initial_status
    db_session.commit()

    with pytest.raises(ParticipationRequestStatusError):
        approve_participation_request(db_session, request.id, owner)


def test_approve_participation_request_rejects_when_capacity_would_be_exceeded(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner7@gmail.com")
    requester = make_user(name="Requester", email="requester6@gmail.com")
    requester2 = make_user(name="Requester2", email="requester7@gmail.com")
    activity = make_activity(owner, max_participants=1)

    first_request = create_participation_request(db_session, activity.id, requester, 1)
    second_request = create_participation_request(db_session, activity.id, requester2, 1)

    approve_participation_request(db_session, first_request.id, owner)

    with pytest.raises(ActivityNotAcceptingRequestsError):
        approve_participation_request(db_session, second_request.id, owner)


def test_approving_last_spot_marks_activity_full(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner8@gmail.com")
    requester = make_user(name="Requester", email="requester8@gmail.com")
    activity = make_activity(owner, max_participants=1)
    request = create_participation_request(db_session, activity.id, requester, 1)

    approved_request = approve_participation_request(db_session, request.id, owner)

    assert approved_request.status == ParticipationStatus.APPROVED
    assert activity.status == ActivityStatus.FULL


def test_reject_participation_request_rejects_non_owner(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner9@gmail.com")
    requester = make_user(name="Requester", email="requester9@gmail.com")
    activity = make_activity(owner)
    request = create_participation_request(db_session, activity.id, requester, 1)

    with pytest.raises(NotParticipationOwnerError):
        reject_participation_request(db_session, request.id, requester)


def test_reject_participation_request_rejects_non_pending_requests(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner10@gmail.com")
    requester = make_user(name="Requester", email="requester10@gmail.com")
    activity = make_activity(owner)
    request = create_participation_request(db_session, activity.id, requester, 1)
    request.status = ParticipationStatus.APPROVED
    db_session.commit()

    with pytest.raises(ParticipationRequestStatusError):
        reject_participation_request(db_session, request.id, owner)


def test_concurrent_approvals_never_exceed_capacity(engine, db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner11@gmail.com")
    activity = make_activity(owner, max_participants=1)

    requesters = [
        make_user(name=f"Requester{i}", email=f"requester11{i}@gmail.com")
        for i in range(3)
    ]

    request_ids = []
    for requester in requesters:
        request = create_participation_request(db_session, activity.id, requester, 1)
        request_ids.append(request.id)

    results = []
    errors = []
    barrier = threading.Barrier(len(request_ids))
    SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

    def worker(request_id: int):
        barrier.wait()
        session = SessionLocal()
        try:
            approve_participation_request(session, request_id, owner)
            results.append(request_id)
        except Exception as exc:  # noqa: BLE001
            errors.append((request_id, type(exc).__name__, str(exc)))
        finally:
            session.close()

    threads = [threading.Thread(target=worker, args=(request_id,)) for request_id in request_ids]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    db_session.expire_all()
    fresh_activity = db_session.query(Activity).filter(Activity.id == activity.id).first()
    approved_count = db_session.query(ParticipationRequest).filter(
        ParticipationRequest.activity_id == activity.id,
        ParticipationRequest.status == ParticipationStatus.APPROVED,
    ).count()

    assert approved_count == 1
    assert len(results) == 1
    assert approved_count <= fresh_activity.max_participants
    assert fresh_activity.status == ActivityStatus.FULL
