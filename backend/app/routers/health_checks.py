from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.health_check import HealthCheckCreate, HealthCheckListResponse, HealthCheckRead, HealthCheckUpdate
from app.services.health_check_service import HealthCheckService

router = APIRouter(prefix="/health-checks", tags=["Health Checks"])


@router.get("", response_model=HealthCheckListResponse)
def list_health_checks(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HealthCheckService(db, current_user)
    result = service.list_checks(page=page, limit=limit, search=search)
    return HealthCheckListResponse(
        items=[HealthCheckRead.model_validate(c) for c in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=HealthCheckRead, status_code=status.HTTP_201_CREATED)
def create_health_check(
    payload: HealthCheckCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HealthCheckService(db, current_user)
    check = service.create_check(payload)
    return HealthCheckRead.model_validate(check)


@router.get("/{check_id}", response_model=HealthCheckRead)
def get_health_check(
    check_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HealthCheckService(db, current_user)
    return HealthCheckRead.model_validate(service.get_check(check_id))


@router.put("/{check_id}", response_model=HealthCheckRead)
def update_health_check(
    check_id: int,
    payload: HealthCheckUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HealthCheckService(db, current_user)
    check = service.update_check(check_id, payload)
    return HealthCheckRead.model_validate(check)


@router.delete("/{check_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_health_check(
    check_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HealthCheckService(db, current_user)
    service.delete_check(check_id)
