from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserProfileUpdate
from app.repositories import user_repository

def update_profile(db: Session, user: User, data: UserProfileUpdate) -> User:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    return user_repository.save(db, user)