from __future__ import annotations

from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate


class HostedZoneService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_zones(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Page must be >= 1")
        if limit < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Limit must be >= 1")

        query = self.db.query(HostedZone).filter(HostedZone.user_id == self.user.id)

        if search:
            search_term = search.strip()
            if search_term:
                query = query.filter(HostedZone.name.ilike(f"%{search_term}%"))

        total = query.count()
        zones = query.order_by(HostedZone.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "items": zones,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if total else 0,
        }

    def create_zone(self, payload: HostedZoneCreate) -> HostedZone:
        existing = (
            self.db.query(HostedZone)
            .filter(HostedZone.user_id == self.user.id)
            .filter(func.lower(HostedZone.name) == payload.name.strip().lower())
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Hosted zone with this name already exists",
            )

        zone = HostedZone(
            user_id=self.user.id,
            name=payload.name.strip(),
            description=payload.description.strip() if payload.description else None,
        )
        self.db.add(zone)
        self.db.commit()
        self.db.refresh(zone)
        return zone

    def get_zone(self, zone_id: int) -> HostedZone:
        zone = self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
        if zone.user_id != self.user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return zone

    def update_zone(self, zone_id: int, payload: HostedZoneUpdate) -> HostedZone:
        zone = self.get_zone(zone_id)

        if payload.name is not None:
            name = payload.name.strip()
            duplicate = (
                self.db.query(HostedZone)
                .filter(HostedZone.user_id == self.user.id)
                .filter(HostedZone.id != zone_id)
                .filter(func.lower(HostedZone.name) == name.lower())
                .first()
            )
            if duplicate:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Hosted zone with this name already exists",
                )
            zone.name = name

        if payload.description is not None:
            zone.description = payload.description.strip() if payload.description.strip() else None

        self.db.commit()
        self.db.refresh(zone)
        return zone

    def delete_zone(self, zone_id: int) -> None:
        zone = self.get_zone(zone_id)
        self.db.delete(zone)
        self.db.commit()
