from __future__ import annotations

from datetime import datetime

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DNSRecord(Base):
    __tablename__ = "dns_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    hosted_zone_id: Mapped[int] = mapped_column(ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    ttl: Mapped[int] = mapped_column(Integer, nullable=False, default=300)
    priority: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight: Mapped[int | None] = mapped_column(Integer, nullable=True)
    port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target: Mapped[str | None] = mapped_column(String(255), nullable=True)
    flag: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tag: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    hosted_zone: Mapped["HostedZone"] = relationship(back_populates="dns_records")
