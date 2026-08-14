from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.cidr_collection import CidrCollectionCreate, CidrCollectionListResponse, CidrCollectionRead, CidrCollectionUpdate
from app.services.cidr_collection_service import CidrCollectionService

router = APIRouter(prefix="/cidr-collections", tags=["CIDR Collections"])


@router.get("", response_model=CidrCollectionListResponse)
def list_cidr_collections(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CidrCollectionService(db, current_user)
    result = service.list_collections(page=page, limit=limit, search=search)
    return CidrCollectionListResponse(
        items=[CidrCollectionRead.model_validate(c) for c in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=CidrCollectionRead, status_code=status.HTTP_201_CREATED)
def create_cidr_collection(
    payload: CidrCollectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CidrCollectionService(db, current_user)
    collection = service.create_collection(payload)
    return CidrCollectionRead.model_validate(collection)


@router.get("/{collection_id}", response_model=CidrCollectionRead)
def get_cidr_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CidrCollectionService(db, current_user)
    return CidrCollectionRead.model_validate(service.get_collection(collection_id))


@router.put("/{collection_id}", response_model=CidrCollectionRead)
def update_cidr_collection(
    collection_id: int,
    payload: CidrCollectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CidrCollectionService(db, current_user)
    collection = service.update_collection(collection_id, payload)
    return CidrCollectionRead.model_validate(collection)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cidr_collection(
    collection_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = CidrCollectionService(db, current_user)
    service.delete_collection(collection_id)
