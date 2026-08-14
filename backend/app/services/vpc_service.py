from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.exceptions import NotFoundError
from app.models.user import User
from app.models.vpc import Vpc
from app.schemas.vpc import VpcCreate, VpcUpdate
from app.utils.pagination import paginate


class VpcService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_vpcs(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(Vpc).filter(Vpc.user_id == self.user.id)
        if search:
            term = search.strip()
            if term:
                pattern = f"%{term}%"
                query = query.filter(
                    Vpc.vpc_id.ilike(pattern) | Vpc.description.ilike(pattern)
                )
        return paginate(query.order_by(Vpc.created_at.desc()), page, limit)

    def create_vpc(self, payload: VpcCreate) -> Vpc:
        vpc = Vpc(
            user_id=self.user.id,
            vpc_id=payload.vpc_id.strip(),
            region=payload.region.strip(),
            cidr_block=payload.cidr_block.strip(),
            description=payload.description.strip() if payload.description else None,
        )
        self.db.add(vpc)
        self.db.commit()
        self.db.refresh(vpc)
        return vpc

    def get_vpc(self, vpc_pk: int) -> Vpc:
        vpc = self.db.query(Vpc).filter(Vpc.id == vpc_pk).first()
        if not vpc or vpc.user_id != self.user.id:
            raise NotFoundError("VPC not found")
        return vpc

    def update_vpc(self, vpc_pk: int, payload: VpcUpdate) -> Vpc:
        vpc = self.get_vpc(vpc_pk)
        if payload.region is not None:
            vpc.region = payload.region.strip()
        if payload.cidr_block is not None:
            vpc.cidr_block = payload.cidr_block.strip()
        if payload.description is not None:
            vpc.description = payload.description.strip() or None
        self.db.commit()
        self.db.refresh(vpc)
        return vpc

    def delete_vpc(self, vpc_pk: int) -> None:
        vpc = self.get_vpc(vpc_pk)
        self.db.delete(vpc)
        self.db.commit()
