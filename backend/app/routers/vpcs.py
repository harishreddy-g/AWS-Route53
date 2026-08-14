from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.vpc import VpcCreate, VpcListResponse, VpcRead, VpcUpdate
from app.services.vpc_service import VpcService

router = APIRouter(prefix="/vpcs", tags=["VPCs"])


@router.get("", response_model=VpcListResponse)
def list_vpcs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VpcService(db, current_user)
    result = service.list_vpcs(page=page, limit=limit, search=search)
    return VpcListResponse(
        items=[VpcRead.model_validate(v) for v in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=VpcRead, status_code=status.HTTP_201_CREATED)
def create_vpc(
    payload: VpcCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VpcService(db, current_user)
    vpc = service.create_vpc(payload)
    return VpcRead.model_validate(vpc)


@router.get("/{vpc_pk}", response_model=VpcRead)
def get_vpc(
    vpc_pk: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VpcService(db, current_user)
    return VpcRead.model_validate(service.get_vpc(vpc_pk))


@router.put("/{vpc_pk}", response_model=VpcRead)
def update_vpc(
    vpc_pk: int,
    payload: VpcUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VpcService(db, current_user)
    vpc = service.update_vpc(vpc_pk, payload)
    return VpcRead.model_validate(vpc)


@router.delete("/{vpc_pk}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vpc(
    vpc_pk: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VpcService(db, current_user)
    service.delete_vpc(vpc_pk)
