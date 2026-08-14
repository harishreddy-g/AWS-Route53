from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    pass


SQLALCHEMY_DATABASE_URL = settings.database_url

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {},
    future=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)


def init_db() -> None:
    """Create database tables and schema for the application."""
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)


def get_db():
    """Provide a SQLAlchemy database session for request-scoped use."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
