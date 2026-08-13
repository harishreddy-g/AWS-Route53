from datetime import datetime

from pydantic import BaseModel, Field, field_validator

SUPPORTED_RECORD_TYPES = {
    "A",
    "AAAA",
    "CNAME",
    "TXT",
    "MX",
    "NS",
    "PTR",
    "SRV",
    "CAA",
}


class DNSRecordBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    type: str = Field(..., min_length=1, max_length=20)
    value: str = Field(..., min_length=1, max_length=1000)
    ttl: int = Field(default=300, ge=1, le=2147483647)
    priority: int | None = Field(default=None, ge=0)
    weight: int | None = Field(default=None, ge=0)
    port: int | None = Field(default=None, ge=1)
    target: str | None = Field(default=None, max_length=255)
    flag: int | None = Field(default=None, ge=0)
    tag: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Record name cannot be empty")
        return cleaned

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str) -> str:
        normalized = value.strip().upper()
        if normalized not in SUPPORTED_RECORD_TYPES:
            raise ValueError(f"Unsupported record type: {value}")
        return normalized

    @field_validator("value")
    @classmethod
    def validate_value(cls, value: str) -> str:
        return value.strip()


class DNSRecordCreate(DNSRecordBase):
    pass


class DNSRecordUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: str | None = Field(default=None, min_length=1, max_length=20)
    value: str | None = Field(default=None, min_length=1, max_length=1000)
    ttl: int | None = Field(default=None, ge=1, le=2147483647)
    priority: int | None = Field(default=None, ge=0)
    weight: int | None = Field(default=None, ge=0)
    port: int | None = Field(default=None, ge=1)
    target: str | None = Field(default=None, max_length=255)
    flag: int | None = Field(default=None, ge=0)
    tag: str | None = Field(default=None, max_length=50)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Record name cannot be empty")
        return cleaned

    @field_validator("type")
    @classmethod
    def validate_type(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip().upper()
        if normalized not in SUPPORTED_RECORD_TYPES:
            raise ValueError(f"Unsupported record type: {value}")
        return normalized

    @field_validator("value")
    @classmethod
    def validate_value(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return value.strip()


class DNSRecordRead(DNSRecordBase):
    id: int
    hosted_zone_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DNSRecordListResponse(BaseModel):
    items: list[DNSRecordRead]
    page: int
    limit: int
    total: int
    total_pages: int
