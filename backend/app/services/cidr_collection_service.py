from __future__ import annotations

from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.exceptions import ConflictError, NotFoundError
from app.models.cidr_collection import CidrCollection
from app.models.user import User
from app.schemas.cidr_collection import CidrCollectionCreate, CidrCollectionUpdate
from app.utils.pagination import paginate


class CidrCollectionService:
    def __init__(self, db: Session, user: User):
        self.db = db
        self.user = user

    def list_collections(self, page: int, limit: int, search: str | None) -> dict[str, Any]:
        query = self.db.query(CidrCollection).filter(CidrCollection.user_id == self.user.id)
        if search:
            term = search.strip()
            if term:
                query = query.filter(CidrCollection.name.ilike(f"%{term}%"))
        return paginate(query.order_by(CidrCollection.created_at.desc()), page, limit)

    def create_collection(self, payload: CidrCollectionCreate) -> CidrCollection:
        collection = CidrCollection(
            user_id=self.user.id,
            name=payload.name.strip(),
            version=1,
        )
        self.db.add(collection)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("A CIDR collection with this name already exists") from exc
        self.db.refresh(collection)
        return collection

    def get_collection(self, collection_id: int) -> CidrCollection:
        collection = self.db.query(CidrCollection).filter(CidrCollection.id == collection_id).first()
        if not collection or collection.user_id != self.user.id:
            raise NotFoundError("CIDR collection not found")
        return collection

    def update_collection(self, collection_id: int, payload: CidrCollectionUpdate) -> CidrCollection:
        collection = self.get_collection(collection_id)
        if payload.name is not None:
            collection.name = payload.name.strip()
        self.db.commit()
        self.db.refresh(collection)
        return collection

    def delete_collection(self, collection_id: int) -> None:
        collection = self.get_collection(collection_id)
        self.db.delete(collection)
        self.db.commit()
