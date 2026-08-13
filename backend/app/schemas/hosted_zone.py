from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class HostedZoneBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Hosted zone name cannot be empty")
        return cleaned


class HostedZoneCreate(HostedZoneBase):
    pass


class HostedZoneUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Hosted zone name cannot be empty")
        return cleaned


class HostedZoneRead(HostedZoneBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HostedZoneListResponse(BaseModel):
    items: list[HostedZoneRead]
    page: int
    limit: int
    total: int
    total_pages: int
