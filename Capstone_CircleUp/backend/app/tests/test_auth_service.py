from datetime import timezone

import pytest
from pydantic import ValidationError

from app.core.security import decode_access_token, verify_password
from app.schemas.auth import RegisterRequest
from app.services.auth_service import (
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
    authenticate_user,
    create_token_for_user,
    register_user,
)


@pytest.fixture
def valid_payload():
    return RegisterRequest(
        name="Alice",
        email="alice@gmail.com",
        password="StrongPass123!",
        phone_number="1234567890",
        city="Mumbai",
        bio="Hello world",
    )


def test_register_user_creates_user_and_hashes_password(db_session, valid_payload):
    user = register_user(db_session, valid_payload)

    assert user.id is not None
    assert user.hashed_password != valid_payload.password
    assert verify_password(valid_payload.password, user.hashed_password)


def test_register_user_raises_for_duplicate_email(db_session, valid_payload):
    register_user(db_session, valid_payload)

    with pytest.raises(EmailAlreadyRegisteredError):
        register_user(db_session, valid_payload)


def test_authenticate_user_raises_for_wrong_password(db_session, valid_payload):
    register_user(db_session, valid_payload)

    with pytest.raises(InvalidCredentialsError):
        authenticate_user(db_session, valid_payload.email, "WrongPass123!")


def test_authenticate_user_raises_for_unknown_email(db_session, valid_payload):
    with pytest.raises(InvalidCredentialsError):
        authenticate_user(db_session, valid_payload.email, valid_payload.password)


def test_authenticate_user_returns_user_for_valid_credentials(db_session, valid_payload):
    register_user(db_session, valid_payload)

    user = authenticate_user(db_session, valid_payload.email, valid_payload.password)

    assert user.email == valid_payload.email


def test_create_token_for_user_round_trips_to_user_id(db_session, valid_payload):
    user = register_user(db_session, valid_payload)

    token = create_token_for_user(user)

    assert decode_access_token(token) == str(user.id)
