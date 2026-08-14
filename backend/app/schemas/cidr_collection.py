from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CidrCollectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Name cannot be empty")
        return cleaned


class CidrCollectionCreate(CidrCollectionBase):
    pass


class CidrCollectionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)


class CidrCollectionRead(CidrCollectionBase):
    id: int
    user_id: int
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CidrCollectionListResponse(BaseModel):
    items: list[CidrCollectionRead]
    page: int
    limit: int
    total: int
    total_pages: int
