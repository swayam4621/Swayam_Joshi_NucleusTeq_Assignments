import logging
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.repositories import user_repository

logger = logging.getLogger("circleup")

class EmailAlreadyRegisteredError(Exception): pass
class UserNotFoundError(Exception): pass
class IncorrectPasswordError(Exception): pass


def register_user(db: Session, data: RegisterRequest) -> User:
    existing = user_repository.get_by_email(db, data.email)
    if existing is not None:
        raise EmailAlreadyRegisteredError(f"Email '{data.email}' is already registered.")

    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        phone_number=data.phone_number,
        city=data.city,
        bio=data.bio,
    )
    return user_repository.create(db, user)


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = user_repository.get_by_email(db, email)
    if user is None:
        logger.warning("Failed login attempt - no account for email: %s", email)
        raise UserNotFoundError("No account found with this email.")
    if not verify_password(password, user.hashed_password):
        logger.warning("Failed login attempt - wrong password for email: %s", email)
        raise IncorrectPasswordError("Incorrect password.")
    return user


def create_token_for_user(user: User) -> str:
    return create_access_token(subject=str(user.id))