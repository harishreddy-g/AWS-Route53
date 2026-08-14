from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


ROUTING_TYPES = Literal["Simple", "Weighted", "Latency", "Failover", "Geolocation", "Multivalue", "IP-based"]


class TrafficPolicyBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    routing_type: ROUTING_TYPES = "Simple"
    comment: str | None = Field(default=None, max_length=1000)
    document: str = Field(default="{}", description="JSON policy document string")

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty")
        return cleaned


class TrafficPolicyCreate(TrafficPolicyBase):
    pass


class TrafficPolicyUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    routing_type: ROUTING_TYPES | None = None
    comment: str | None = None
    document: str | None = None


class TrafficPolicyRead(TrafficPolicyBase):
    id: int
    user_id: int
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TrafficPolicyListResponse(BaseModel):
    items: list[TrafficPolicyRead]
    page: int
    limit: int
    total: int
    total_pages: int
