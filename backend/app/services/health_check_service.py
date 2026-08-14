from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.health_check import HealthCheck
from app.models.user import User
from app.schemas.health_check import HealthCheckCreate, HealthCheckUpdate
from app.utils.pagination import paginate


class HealthCheckService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_checks(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(HealthCheck).filter(HealthCheck.user_id == self.user.id)
        if search:
            term = search.strip()
            if term:
                pattern = f"%{term}%"
                query = query.filter(
                    HealthCheck.name.ilike(pattern) | HealthCheck.domain_name.ilike(pattern)
                )
        return paginate(query.order_by(HealthCheck.created_at.desc()), page, limit)

    def create_check(self, payload: HealthCheckCreate) -> HealthCheck:
        check = HealthCheck(
            user_id=self.user.id,
            name=payload.name.strip(),
            protocol=payload.protocol,
            domain_name=payload.domain_name.strip() if payload.domain_name else None,
            ip_address=payload.ip_address.strip() if payload.ip_address else None,
            port=payload.port,
            resource_path=payload.resource_path or "/",
            request_interval=payload.request_interval,
            failure_threshold=payload.failure_threshold,
            status="Unknown",
        )
        self.db.add(check)
        self.db.commit()
        self.db.refresh(check)
        return check

    def get_check(self, check_id: int) -> HealthCheck:
        check = self.db.query(HealthCheck).filter(HealthCheck.id == check_id).first()
        if not check or check.user_id != self.user.id:
            raise NotFoundError("Health check not found")
        return check

    def update_check(self, check_id: int, payload: HealthCheckUpdate) -> HealthCheck:
        check = self.get_check(check_id)
        if payload.name is not None:
            check.name = payload.name.strip()
        if payload.protocol is not None:
            check.protocol = payload.protocol
        if payload.domain_name is not None:
            check.domain_name = payload.domain_name.strip() or None
        if payload.ip_address is not None:
            check.ip_address = payload.ip_address.strip() or None
        if payload.port is not None:
            check.port = payload.port
        if payload.resource_path is not None:
            check.resource_path = payload.resource_path
        if payload.request_interval is not None:
            check.request_interval = payload.request_interval
        if payload.failure_threshold is not None:
            check.failure_threshold = payload.failure_threshold
        if payload.status is not None:
            check.status = payload.status
        self.db.commit()
        self.db.refresh(check)
        return check

    def delete_check(self, check_id: int) -> None:
        check = self.get_check(check_id)
        self.db.delete(check)
        self.db.commit()
