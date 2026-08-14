from __future__ import annotations

from typing import Protocol

from ipaddress import IPv4Address, IPv6Address

from app.exceptions import NotFoundError, ValidationError
from app.models.dns_record import DNSRecord
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate


class RecordPayload(Protocol):
    type: str | None
    value: str | None
    priority: int | None
    weight: int | None
    port: int | None
    target: str | None
    flag: int | None
    tag: str | None


def validate_record_payload(payload: RecordPayload) -> None:
    record_type = payload.type.upper() if payload.type else None
    value = payload.value.strip() if payload.value else ""

    if record_type is None:
        return

    if record_type == "A":
        try:
            IPv4Address(value)
        except ValueError as exc:
            raise ValidationError("A record value must be a valid IPv4 address") from exc

    elif record_type == "AAAA":
        try:
            IPv6Address(value)
        except ValueError as exc:
            raise ValidationError("AAAA record value must be a valid IPv6 address") from exc

    elif record_type == "CNAME":
        if not value or ("." not in value and value != "@"):
            raise ValidationError("CNAME record value must be a valid hostname")

    elif record_type == "MX":
        if payload.priority is None:
            raise ValidationError("MX record requires a priority")
        if not value or "." not in value:
            raise ValidationError("MX record value must be a valid mail server hostname")

    elif record_type == "TXT":
        if not value:
            raise ValidationError("TXT record value cannot be empty")

    elif record_type == "NS":
        if not value or "." not in value:
            raise ValidationError("NS record value must be a valid nameserver hostname")

    elif record_type == "PTR":
        if not value or "." not in value:
            raise ValidationError("PTR record value must be a valid hostname")

    elif record_type == "SRV":
        if payload.priority is None or payload.weight is None or payload.port is None:
            raise ValidationError("SRV record requires priority, weight, and port")
        if not value and not payload.target:
            raise ValidationError("SRV record requires a target value")

    elif record_type == "CAA":
        if payload.flag is None:
            raise ValidationError("CAA record requires a flag")
        if not payload.tag:
            raise ValidationError("CAA record requires a tag")
        if not value:
            raise ValidationError("CAA record requires a value")


def clear_type_specific_fields(record: DNSRecord) -> None:
    record_type = record.type.upper()

    if record_type not in {"MX", "SRV"}:
        record.priority = None
    if record_type != "SRV":
        record.weight = None
        record.port = None
        record.target = None
    if record_type != "CAA":
        record.flag = None
        record.tag = None


def apply_record_update(record: DNSRecord, payload: DNSRecordUpdate) -> None:
    previous_type = record.type

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

    if payload.type is not None and payload.type.upper() != previous_type.upper():
        clear_type_specific_fields(record)
