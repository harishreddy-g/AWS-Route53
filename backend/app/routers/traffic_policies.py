from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.traffic_policy import TrafficPolicyCreate, TrafficPolicyListResponse, TrafficPolicyRead, TrafficPolicyUpdate
from app.services.traffic_policy_service import TrafficPolicyService

router = APIRouter(prefix="/traffic-policies", tags=["Traffic Policies"])


@router.get("", response_model=TrafficPolicyListResponse)
def list_traffic_policies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TrafficPolicyService(db, current_user)
    result = service.list_policies(page=page, limit=limit, search=search)
    return TrafficPolicyListResponse(
        items=[TrafficPolicyRead.model_validate(p) for p in result["items"]],
        page=result["page"],
        limit=result["limit"],
        total=result["total"],
        total_pages=result["total_pages"],
    )


@router.post("", response_model=TrafficPolicyRead, status_code=status.HTTP_201_CREATED)
def create_traffic_policy(
    payload: TrafficPolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TrafficPolicyService(db, current_user)
    policy = service.create_policy(payload)
    return TrafficPolicyRead.model_validate(policy)


@router.get("/{policy_id}", response_model=TrafficPolicyRead)
def get_traffic_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TrafficPolicyService(db, current_user)
    return TrafficPolicyRead.model_validate(service.get_policy(policy_id))


@router.put("/{policy_id}", response_model=TrafficPolicyRead)
def update_traffic_policy(
    policy_id: int,
    payload: TrafficPolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TrafficPolicyService(db, current_user)
    policy = service.update_policy(policy_id, payload)
    return TrafficPolicyRead.model_validate(policy)


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_traffic_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TrafficPolicyService(db, current_user)
    service.delete_policy(policy_id)
