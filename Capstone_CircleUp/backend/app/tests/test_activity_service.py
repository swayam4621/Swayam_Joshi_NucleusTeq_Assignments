from datetime import datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.models.activity import ActivityStatus
from app.schemas.activity import ActivityCreate, ActivityUpdate
from app.services.activity_service import (
    ActivityAlreadyCancelledError,
    ActivityNotFoundError,
    NotActivityOwnerError,
    cancel_activity,
    create_activity,
    get_activity,
    update_activity,
)


def test_create_activity_succeeds_with_valid_future_date_and_capacity(db_session, make_user):
    creator = make_user(name="Creator", email="creator@gmail.com")
    payload = ActivityCreate(
        title="Morning Run",
        description="A fun meetup",
        category="Fitness",
        location="Mumbai",
        date=datetime.now(timezone.utc) + timedelta(hours=2),
        max_participants=3,
    )

    activity = create_activity(db_session, creator, payload)

    assert activity.creator_id == creator.id
    assert activity.status == ActivityStatus.OPEN
    assert activity.max_participants == 3


@pytest.mark.parametrize("max_participants", [0, -1])
def test_activity_create_rejects_non_positive_max_participants(max_participants):
    with pytest.raises(ValidationError):
        ActivityCreate(
            title="Morning Run",
            description="A fun meetup",
            category="Fitness",
            location="Mumbai",
            date=datetime.now(timezone.utc) + timedelta(hours=2),
            max_participants=max_participants,
        )


def test_activity_create_rejects_title_under_three_characters():
    with pytest.raises(ValidationError):
        ActivityCreate(
            title="Hi",
            description="A fun meetup",
            category="Fitness",
            location="Mumbai",
            date=datetime.now(timezone.utc) + timedelta(hours=2),
            max_participants=2,
        )


def test_activity_create_rejects_past_date():
    with pytest.raises(ValidationError):
        ActivityCreate(
            title="Morning Run",
            description="A fun meetup",
            category="Fitness",
            location="Mumbai",
            date=datetime.now(timezone.utc) - timedelta(hours=1),
            max_participants=2,
        )


def test_activity_update_rejects_past_date():
    with pytest.raises(ValidationError):
        ActivityUpdate(
            date=datetime.now(timezone.utc) - timedelta(hours=1),
        )


def test_update_activity_raises_for_non_owner(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner@gmail.com")
    other_user = make_user(name="Other", email="other@gmail.com")
    activity = make_activity(owner)

    with pytest.raises(NotActivityOwnerError):
        update_activity(db_session, activity.id, other_user, ActivityUpdate(title="New Title"))


def test_update_activity_raises_for_cancelled_activity(db_session, make_user, make_activity):
    creator = make_user(name="Creator", email="creator2@gmail.com")
    activity = make_activity(creator, status=ActivityStatus.CANCELLED)

    with pytest.raises(ActivityAlreadyCancelledError):
        update_activity(db_session, activity.id, creator, ActivityUpdate(title="New Title"))


def test_cancel_activity_raises_for_non_owner(db_session, make_user, make_activity):
    owner = make_user(name="Owner", email="owner3@gmail.com")
    other_user = make_user(name="Other", email="other3@gmail.com")
    activity = make_activity(owner)

    with pytest.raises(NotActivityOwnerError):
        cancel_activity(db_session, activity.id, other_user)


def test_cancel_activity_raises_for_already_cancelled_activity(db_session, make_user, make_activity):
    creator = make_user(name="Creator", email="creator4@gmail.com")
    activity = make_activity(creator, status=ActivityStatus.CANCELLED)

    with pytest.raises(ActivityAlreadyCancelledError):
        cancel_activity(db_session, activity.id, creator)


def test_get_activity_lazily_marks_past_open_activity_as_completed(db_session, make_user, make_activity):
    creator = make_user(name="Creator", email="creator5@gmail.com")
    activity = make_activity(creator, date=datetime.now(timezone.utc) - timedelta(hours=1), status=ActivityStatus.OPEN)

    fetched = get_activity(db_session, activity.id)

    assert fetched.status == ActivityStatus.COMPLETED


def test_cancelled_activity_status_is_not_overwritten_to_completed(db_session, make_user, make_activity):
    creator = make_user(name="Creator", email="creator6@gmail.com")
    activity = make_activity(creator, date=datetime.now(timezone.utc) - timedelta(hours=1), status=ActivityStatus.CANCELLED)

    fetched = get_activity(db_session, activity.id)

    assert fetched.status == ActivityStatus.CANCELLED
