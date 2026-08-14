from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class RegisteredDomainBase(BaseModel):
    domain_name: str = Field(..., min_length=1, max_length=255)
    auto_renew: bool = True
    expiry_date: str = Field(..., description="Format: YYYY-MM-DD")
    registrant_name: str | None = Field(default=None, max_length=255)
    registrant_email: str | None = Field(default=None, max_length=255)

    @field_validator("domain_name")
    @classmethod
    def validate_domain(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not cleaned:
            raise ValueError("Domain name cannot be empty")
        return cleaned


class RegisteredDomainCreate(RegisteredDomainBase):
    pass


class RegisteredDomainUpdate(BaseModel):
    auto_renew: bool | None = None
    expiry_date: str | None = None
    registrant_name: str | None = None
    registrant_email: str | None = None
    status: str | None = None


class RegisteredDomainRead(RegisteredDomainBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RegisteredDomainListResponse(BaseModel):
    items: list[RegisteredDomainRead]
    page: int
    limit: int
    total: int
    total_pages: int
