from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class VpcBase(BaseModel):
    vpc_id: str = Field(..., min_length=1, max_length=50, description="VPC identifier e.g. vpc-0123456789abcdef0")
    region: str = Field(..., min_length=1, max_length=50)
    cidr_block: str = Field(..., min_length=1, max_length=50)
    description: str | None = Field(default=None, max_length=500)

    @field_validator("vpc_id")
    @classmethod
    def validate_vpc_id(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("VPC ID cannot be empty")
        return cleaned


class VpcCreate(VpcBase):
    pass


class VpcUpdate(BaseModel):
    region: str | None = Field(default=None, max_length=50)
    cidr_block: str | None = Field(default=None, max_length=50)
    description: str | None = None


class VpcRead(VpcBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VpcListResponse(BaseModel):
    items: list[VpcRead]
    page: int
    limit: int
    total: int
    total_pages: int
