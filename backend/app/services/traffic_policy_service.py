from __future__ import annotations

from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.traffic_policy import TrafficPolicy
from app.models.user import User
from app.schemas.traffic_policy import TrafficPolicyCreate, TrafficPolicyUpdate
from app.utils.pagination import paginate


class TrafficPolicyService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_policies(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(TrafficPolicy).filter(TrafficPolicy.user_id == self.user.id)
        if search:
            term = search.strip()
            if term:
                pattern = f"%{term}%"
                query = query.filter(TrafficPolicy.name.ilike(pattern))
        return paginate(query.order_by(TrafficPolicy.created_at.desc()), page, limit)

    def create_policy(self, payload: TrafficPolicyCreate) -> TrafficPolicy:
        policy = TrafficPolicy(
            user_id=self.user.id,
            name=payload.name.strip(),
            routing_type=payload.routing_type,
            comment=payload.comment.strip() if payload.comment else None,
            document=payload.document,
            version=1,
        )
        self.db.add(policy)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("A traffic policy with this name already exists") from exc
        self.db.refresh(policy)
        return policy

    def get_policy(self, policy_id: int) -> TrafficPolicy:
        policy = self.db.query(TrafficPolicy).filter(TrafficPolicy.id == policy_id).first()
        if not policy or policy.user_id != self.user.id:
            raise NotFoundError("Traffic policy not found")
        return policy

    def update_policy(self, policy_id: int, payload: TrafficPolicyUpdate) -> TrafficPolicy:
        policy = self.get_policy(policy_id)
        if payload.name is not None:
            policy.name = payload.name.strip()
        if payload.routing_type is not None:
            policy.routing_type = payload.routing_type
        if payload.comment is not None:
            policy.comment = payload.comment.strip() or None
        if payload.document is not None:
            policy.document = payload.document
            policy.version = policy.version + 1
        self.db.commit()
        self.db.refresh(policy)
        return policy

    def delete_policy(self, policy_id: int) -> None:
        policy = self.get_policy(policy_id)
        self.db.delete(policy)
        self.db.commit()
