from __future__ import annotations

from ipaddress import IPv4Address, IPv6Address
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate


class DNSRecordService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def _get_zone(self, zone_id: int) -> HostedZone:
        zone = self.db.query(HostedZone).filter(HostedZone.id == zone_id).first()
        if not zone:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
        if zone.user_id != self.user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        return zone

    def _validate_record_payload(self, payload: DNSRecordCreate | DNSRecordUpdate) -> None:
        record_type = payload.type.upper() if isinstance(payload, DNSRecordCreate) else payload.type.upper() if payload.type else None
        value = payload.value.strip() if payload.value else ""

        if record_type is None:
            return

        if record_type == "A":
            try:
                IPv4Address(value)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A record value must be a valid IPv4 address") from exc

        elif record_type == "AAAA":
            try:
                IPv6Address(value)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="AAAA record value must be a valid IPv6 address") from exc

        elif record_type == "CNAME":
            if not value or "." not in value and value != "@":
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CNAME record value must be a valid hostname")

        elif record_type == "MX":
            if payload.priority is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MX record requires a priority")
            if not value or "." not in value:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="MX record value must be a valid mail server hostname")

        elif record_type == "TXT":
            if not value:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="TXT record value cannot be empty")

        elif record_type == "NS":
            if not value or "." not in value:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="NS record value must be a valid nameserver hostname")

        elif record_type == "PTR":
            if not value or "." not in value:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="PTR record value must be a valid hostname")

        elif record_type == "SRV":
            if payload.priority is None or payload.weight is None or payload.port is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="SRV record requires priority, weight, and port",
                )
            if not value and not payload.target:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SRV record requires a target value")

        elif record_type == "CAA":
            if payload.flag is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CAA record requires a flag")
            if not payload.tag:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CAA record requires a tag")
            if not value:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CAA record requires a value")

    def list_records(self, zone_id: int, page: int, limit: int, search: str | None, record_type: str | None) -> dict[str, Any]:
        if page < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Page must be >= 1")
        if limit < 1:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Limit must be >= 1")

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

        total = query.count()
        records = query.order_by(DNSRecord.name.asc(), DNSRecord.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return {
            "items": records,
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": (total + limit - 1) // limit if total else 0,
        }

    def create_record(self, zone_id: int, payload: DNSRecordCreate) -> DNSRecord:
        zone = self._get_zone(zone_id)
        self._validate_record_payload(payload)

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
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
        return record

    def update_record(self, zone_id: int, record_id: int, payload: DNSRecordUpdate) -> DNSRecord:
        record = self.get_record(zone_id, record_id)

        if payload.name is not None:
            record.name = payload.name.strip()
        if payload.type is not None:
            record.type = payload.type.upper()
        if payload.value is not None:
            record.value = payload.value.strip()
        if payload.ttl is not None:
            record.ttl = payload.ttl
        if payload.priority is not None:
            record.priority = payload.priority
        if payload.weight is not None:
            record.weight = payload.weight
        if payload.port is not None:
            record.port = payload.port
        if payload.target is not None:
            record.target = payload.target.strip() if payload.target else None
        if payload.flag is not None:
            record.flag = payload.flag
        if payload.tag is not None:
            record.tag = payload.tag.strip() if payload.tag else None

        if record.type == "A":
            try:
                IPv4Address(record.value)
            except ValueError as exc:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A record value must be a valid IPv4 address") from exc

        self._validate_record_payload(record)

        self.db.commit()
        self.db.refresh(record)
        return record

    def delete_record(self, zone_id: int, record_id: int) -> None:
        record = self.get_record(zone_id, record_id)
        self.db.delete(record)
        self.db.commit()
