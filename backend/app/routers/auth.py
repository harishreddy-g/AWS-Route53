from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.rate_limit import check_login_rate_limit
from app.core.security import generate_session_token, get_session_expiration, hash_session_token, verify_password
from app.database import get_db
from app.dependencies.auth import get_current_token, get_current_user
from app.models.session import Session as SessionModel
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, LoginResponse, MessageResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    check_login_rate_limit(
        payload.email.lower(),
        max_attempts=settings.login_rate_limit_attempts,
        window_seconds=settings.login_rate_limit_window_seconds,
    )

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = generate_session_token()
    session = SessionModel(
        user_id=user.id,
        token_hash=hash_session_token(token),
        expires_at=get_session_expiration(days=7),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return LoginResponse(
        access_token=token,
        user=UserResponse(id=user.id, email=user.email),
    )


@router.get("/me", response_model=AuthResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)) -> AuthResponse:
    return AuthResponse(
        message="User retrieved successfully",
        data=UserResponse(id=current_user.id, email=current_user.email),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    token: str = Depends(get_current_token),
    db: Session = Depends(get_db),
) -> MessageResponse:
    token_hash = hash_session_token(token)
    db.query(SessionModel).filter(SessionModel.token_hash == token_hash).delete()
    db.commit()

    return MessageResponse(message="Logged out successfully")
