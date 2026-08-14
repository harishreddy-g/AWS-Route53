from datetime import datetime

from app.config import settings
from app.core.security import hash_password, utc_now
from app.database import SessionLocal
from app.models.user import User


def seed_default_user() -> None:
    if not settings.seed_default_user:
        return

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            return

        user = User(
            email="admin@example.com",
            password_hash=hash_password("password123"),
            created_at=utc_now(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    finally:
        db.close()
