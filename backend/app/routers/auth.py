from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import generate_session_token, get_session_expiration, verify_password
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.session import Session as SessionModel
from app.models.user import User
from app.schemas.auth import AuthResponse, LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = generate_session_token()
    session = SessionModel(
        user_id=user.id,
        token=token,
        expires_at=get_session_expiration(days=7),
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(id=user.id, email=user.email),
    )


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)) -> AuthResponse:
    return AuthResponse(
        success=True,
        message="User retrieved successfully",
        data=UserResponse(id=current_user.id, email=current_user.email),
    )


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuthResponse:
    db.query(SessionModel).filter(SessionModel.user_id == current_user.id).delete()
    db.commit()

    return AuthResponse(
        success=True,
        message="Logged out successfully",
        data=None,
    )
