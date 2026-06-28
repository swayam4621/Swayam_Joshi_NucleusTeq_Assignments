from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserPublic
from app.services.auth_service import (
    register_user,
    authenticate_user,
    create_token_for_user,
    EmailAlreadyRegisteredError,
    InvalidCredentialsError,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        user = register_user(db, payload)
    except EmailAlreadyRegisteredError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        user = authenticate_user(db, payload.email, payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc))
    token = create_token_for_user(user)
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT — nothing to invalidate server-side.
    # Client discards the token.
    return {"detail": "Logged out. Please discard your access token client-side."}


@router.get("/me", response_model=UserPublic)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user