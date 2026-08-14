from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.registered_domain import RegisteredDomainCreate, RegisteredDomainListResponse, RegisteredDomainRead, RegisteredDomainUpdate
from app.services.registered_domain_service import RegisteredDomainService

router = APIRouter(prefix="/registered-domains", tags=["Registered Domains"])


@router.get("", response_model=RegisteredDomainListResponse)
def list_registered_domains(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RegisteredDomainService(db, current_user)
    result = service.list_domains(page=page, limit=limit, search=search)
    return RegisteredDomainListResponse(
        items=[RegisteredDomainRead.model_validate(d) for d in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=RegisteredDomainRead, status_code=status.HTTP_201_CREATED)
def create_registered_domain(
    payload: RegisteredDomainCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RegisteredDomainService(db, current_user)
    domain = service.create_domain(payload)
    return RegisteredDomainRead.model_validate(domain)


@router.get("/{domain_id}", response_model=RegisteredDomainRead)
def get_registered_domain(
    domain_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RegisteredDomainService(db, current_user)
    return RegisteredDomainRead.model_validate(service.get_domain(domain_id))


@router.put("/{domain_id}", response_model=RegisteredDomainRead)
def update_registered_domain(
    domain_id: int,
    payload: RegisteredDomainUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RegisteredDomainService(db, current_user)
    domain = service.update_domain(domain_id, payload)
    return RegisteredDomainRead.model_validate(domain)


@router.delete("/{domain_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registered_domain(
    domain_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RegisteredDomainService(db, current_user)
    service.delete_domain(domain_id)
