from __future__ import annotations

from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.registered_domain import RegisteredDomain
from app.models.user import User
from app.schemas.registered_domain import RegisteredDomainCreate, RegisteredDomainUpdate
from app.utils.pagination import paginate


class RegisteredDomainService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_domains(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(RegisteredDomain).filter(RegisteredDomain.user_id == self.user.id)
        if search:
            term = search.strip()
            if term:
                query = query.filter(RegisteredDomain.domain_name.ilike(f"%{term}%"))
        return paginate(query.order_by(RegisteredDomain.created_at.desc()), page, limit)

    def create_domain(self, payload: RegisteredDomainCreate) -> RegisteredDomain:
        existing = (
            self.db.query(RegisteredDomain)
            .filter(RegisteredDomain.user_id == self.user.id)
            .filter(RegisteredDomain.domain_name == payload.domain_name.strip().lower())
            .first()
        )
        if existing:
            raise ConflictError("Domain already registered")

        domain = RegisteredDomain(
            user_id=self.user.id,
            domain_name=payload.domain_name.strip().lower(),
            status="Active",
            auto_renew=payload.auto_renew,
            expiry_date=payload.expiry_date,
            registrant_name=payload.registrant_name,
            registrant_email=payload.registrant_email,
        )
        self.db.add(domain)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("Domain already registered") from exc
        self.db.refresh(domain)
        return domain

    def get_domain(self, domain_id: int) -> RegisteredDomain:
        domain = self.db.query(RegisteredDomain).filter(RegisteredDomain.id == domain_id).first()
        if not domain or domain.user_id != self.user.id:
            raise NotFoundError("Domain not found")
        return domain

    def update_domain(self, domain_id: int, payload: RegisteredDomainUpdate) -> RegisteredDomain:
        domain = self.get_domain(domain_id)
        if payload.auto_renew is not None:
            domain.auto_renew = payload.auto_renew
        if payload.expiry_date is not None:
            domain.expiry_date = payload.expiry_date
        if payload.registrant_name is not None:
            domain.registrant_name = payload.registrant_name
        if payload.registrant_email is not None:
            domain.registrant_email = payload.registrant_email
        if payload.status is not None:
            domain.status = payload.status
        self.db.commit()
        self.db.refresh(domain)
        return domain

    def delete_domain(self, domain_id: int) -> None:
        domain = self.get_domain(domain_id)
        self.db.delete(domain)
        self.db.commit()
