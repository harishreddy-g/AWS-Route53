from __future__ import annotations

from typing import Any

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate
from app.utils.pagination import paginate


class HostedZoneService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_zones(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(HostedZone).filter(HostedZone.user_id == self.user.id)

        if search:
            search_term = search.strip()
            if search_term:
                pattern = f"%{search_term}%"
                query = query.filter(
                    HostedZone.name.ilike(pattern)
                    | HostedZone.description.ilike(pattern)
                )

        return paginate(query.order_by(HostedZone.created_at.desc()), page, limit)

    def create_zone(self, payload: HostedZoneCreate) -> HostedZone:
        existing = (
            self.db.query(HostedZone)
            .filter(HostedZone.user_id == self.user.id)
            .filter(func.lower(HostedZone.name) == payload.name.strip().lower())
            .first()
        )
        if existing:
            raise ConflictError("Hosted zone with this name already exists")

        zone = HostedZone(
            user_id=self.user.id,
            name=payload.name.strip(),
            zone_type=payload.zone_type,
            description=payload.description.strip() if payload.description else None,
        )
        self.db.add(zone)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Hosted zone with this name already exists") from exc

        self.db.refresh(zone)
        return zone

    def get_zone(self, zone_id: int) -> HostedZone:
        zone = self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()
        if not zone or zone.user_id != self.user.id:
            raise NotFoundError("Hosted zone not found")
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
                raise ConflictError("Hosted zone with this name already exists")
            zone.name = name

        if payload.description is not None:
            zone.description = payload.description.strip() if payload.description.strip() else None

        if payload.zone_type is not None:
            zone.zone_type = payload.zone_type

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Hosted zone with this name already exists") from exc

        self.db.refresh(zone)
        return zone

    def delete_zone(self, zone_id: int) -> None:
        zone = self.get_zone(zone_id)
        self.db.delete(zone)
        self.db.commit()
