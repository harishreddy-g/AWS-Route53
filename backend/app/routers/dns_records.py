from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordListResponse, DNSRecordRead, DNSRecordUpdate
from app.services.dns_record_service import DNSRecordService

router = APIRouter(prefix="/hosted-zones/{zone_id}", tags=["DNS Records"])


@router.get("/records", response_model=DNSRecordListResponse)
def list_dns_records(
    zone_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    record_type: str | None = Query(default=None, alias="type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db, current_user)
    result = service.list_records(zone_id=zone_id, page=page, limit=limit, search=search, record_type=record_type)
    return DNSRecordListResponse(
        items=[DNSRecordRead.model_validate(record) for record in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("/records", response_model=DNSRecordRead, status_code=status.HTTP_201_CREATED)
def create_dns_record(
    zone_id: int,
    payload: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db, current_user)
    record = service.create_record(zone_id, payload)
    return DNSRecordRead.model_validate(record)


@router.get("/records/{record_id}", response_model=DNSRecordRead)
def get_dns_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db, current_user)
    record = service.get_record(zone_id, record_id)
    return DNSRecordRead.model_validate(record)


@router.put("/records/{record_id}", response_model=DNSRecordRead)
def update_dns_record(
    zone_id: int,
    record_id: int,
    payload: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db, current_user)
    record = service.update_record(zone_id, record_id, payload)
    return DNSRecordRead.model_validate(record)


@router.delete("/records/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dns_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = DNSRecordService(db, current_user)
    service.delete_record(zone_id, record_id)
