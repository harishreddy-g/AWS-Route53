from __future__ import annotations

from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.security import utc_now
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(nullable=False, default=utc_now)

    sessions: Mapped[list["Session"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    hosted_zones: Mapped[list["HostedZone"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    health_checks: Mapped[list["HealthCheck"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    traffic_policies: Mapped[list["TrafficPolicy"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    cidr_collections: Mapped[list["CidrCollection"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    registered_domains: Mapped[list["RegisteredDomain"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    vpcs: Mapped[list["Vpc"]] = relationship(back_populates="user", cascade="all, delete-orphan")
