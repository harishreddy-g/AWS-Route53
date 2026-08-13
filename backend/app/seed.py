from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User


def seed_default_user() -> None:
    db: Session = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == "admin@example.com").first()
        if existing:
            return

        user = User(
            email="admin@example.com",
            password_hash=hash_password("password123"),
            created_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    finally:
        db.close()
