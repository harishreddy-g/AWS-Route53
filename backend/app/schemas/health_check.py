from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class HealthCheckBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    protocol: Literal["HTTP", "HTTPS", "TCP"] = "HTTP"
    domain_name: str | None = Field(default=None, max_length=255)
    ip_address: str | None = Field(default=None, max_length=45)
    port: int | None = Field(default=None, ge=1, le=65535)
    resource_path: str = Field(default="/", max_length=255)
    request_interval: Literal[10, 30] = 30
    failure_threshold: int = Field(default=3, ge=1, le=10)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty")
        return cleaned


class HealthCheckCreate(HealthCheckBase):
    pass


class HealthCheckUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    protocol: Literal["HTTP", "HTTPS", "TCP"] | None = None
    domain_name: str | None = None
    ip_address: str | None = None
    port: int | None = Field(default=None, ge=1, le=65535)
    resource_path: str | None = Field(default=None, max_length=255)
    request_interval: Literal[10, 30] | None = None
    failure_threshold: int | None = Field(default=None, ge=1, le=10)
    status: str | None = None


class HealthCheckRead(HealthCheckBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HealthCheckListResponse(BaseModel):
    items: list[HealthCheckRead]
    page: int
    limit: int
    total: int
    total_pages: int
