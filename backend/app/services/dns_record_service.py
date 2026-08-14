from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate
from app.services.hosted_zone_service import HostedZoneService
from app.utils.dns_validation import apply_record_update, validate_record_payload
from app.utils.pagination import paginate


class DNSRecordService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user
        self._zone_service = HostedZoneService(db, user)

    def _get_zone(self, zone_id: int) -> HostedZone:
        return self._zone_service.get_zone(zone_id)

    def list_records(self, zone_id: int, page: int, limit: int, search: str | None, record_type: str | None) -> dict[str, Any]:
        zone = self._get_zone(zone_id)
        query = self.db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone.id)

        if search:
            term = search.strip()
            if term:
                query = query.filter(
                    (DNSRecord.name.ilike(f"%{term}%")) | (DNSRecord.value.ilike(f"%{term}%"))
                )

        if record_type:
            normalized = record_type.strip().upper()
            query = query.filter(DNSRecord.type == normalized)

        return paginate(query.order_by(DNSRecord.name.asc(), DNSRecord.created_at.desc()), page, limit)

    def create_record(self, zone_id: int, payload: DNSRecordCreate) -> DNSRecord:
        zone = self._get_zone(zone_id)
        validate_record_payload(payload)

        record = DNSRecord(
            hosted_zone_id=zone.id,
            name=payload.name.strip(),
            type=payload.type.upper(),
            value=payload.value.strip(),
            ttl=payload.ttl,
            priority=payload.priority,
            weight=payload.weight,
            port=payload.port,
            target=payload.target.strip() if payload.target else None,
            flag=payload.flag,
            tag=payload.tag.strip() if payload.tag else None,
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_record(self, zone_id: int, record_id: int) -> DNSRecord:
        zone = self._get_zone(zone_id)
        record = self.db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone.id).first()
        if not record:
            raise NotFoundError("DNS record not found")
        return record

    def update_record(self, zone_id: int, record_id: int, payload: DNSRecordUpdate) -> DNSRecord:
        record = self.get_record(zone_id, record_id)
        apply_record_update(record, payload)
        validate_record_payload(record)

        self.db.commit()
        self.db.refresh(record)
        return record

    def delete_record(self, zone_id: int, record_id: int) -> None:
        record = self.get_record(zone_id, record_id)
        self.db.delete(record)
        self.db.commit()
