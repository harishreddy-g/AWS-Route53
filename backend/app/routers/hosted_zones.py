from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import MessageResponse
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneListResponse, HostedZoneRead, HostedZoneUpdate
from app.services.hosted_zone_service import HostedZoneService

router = APIRouter(prefix="/hosted-zones", tags=["Hosted Zones"])


@router.get("", response_model=HostedZoneListResponse)
def list_hosted_zones(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db, current_user)
    result = service.list_zones(page=page, limit=limit, search=search)
    return HostedZoneListResponse(
        items=[HostedZoneRead.model_validate(zone) for zone in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=HostedZoneRead, status_code=status.HTTP_201_CREATED)
def create_hosted_zone(
    payload: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db, current_user)
    zone = service.create_zone(payload)
    return HostedZoneRead.model_validate(zone)


@router.get("/{zone_id}", response_model=HostedZoneRead)
def get_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db, current_user)
    zone = service.get_zone(zone_id)
    return HostedZoneRead.model_validate(zone)


@router.put("/{zone_id}", response_model=HostedZoneRead)
def update_hosted_zone(
    zone_id: int,
    payload: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db, current_user)
    zone = service.update_zone(zone_id, payload)
    return HostedZoneRead.model_validate(zone)


@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hosted_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = HostedZoneService(db, current_user)
    service.delete_zone(zone_id)
