from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User
from app.schemas.compliance import (
    ScreeningRequest,
    ScreeningResponse,
    ComplianceMetrics,
    CaseCreate,
    CaseUpdate,
    SARFilingRequest,
    SARFilingResponse,
    TravelRuleRequest,
    TravelRuleResponse,
)
from app.compliance.case_service import CaseService

router = APIRouter(prefix="/compliance", tags=["regtech-compliance"])


@router.get("/metrics", response_model=ComplianceMetrics)
def get_compliance_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return overview compliance metrics matching the Vesant.AI dashboard."""
    service = CaseService(db)
    return service.get_metrics()


@router.post("/screen", response_model=ScreeningResponse)
def screen_sanctions_target(
    request: ScreeningRequest,
    current_user: User = Depends(get_current_user),
):
    """Screen an address, entity, or counterparty against the OpenSanctions dataset."""
    service = CaseService(None)
    return service.screen_target(request.query)


@router.get("/cases", response_model=List[Dict[str, Any]])
def list_compliance_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all compliance review cases with joined alert data."""
    service = CaseService(db)
    return service.list_cases()


@router.post("/cases", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def create_compliance_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually or automatically escalate a target into a compliance case."""
    service = CaseService(db)
    return service.create_case(
        target_address=payload.target_address,
        entity_name=payload.entity_name,
        violation_type=payload.violation_type,
        priority=payload.priority,
        risk_score=payload.risk_score,
        notes=payload.notes,
    )


@router.patch("/cases/{case_id}", response_model=Dict[str, Any])
def update_compliance_case(
    case_id: str,
    payload: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update case triage, assign reviewer, or update status."""
    service = CaseService(db)
    updated = service.update_case(
        case_id=case_id,
        status=payload.status,
        priority=payload.priority,
        assigned_to=payload.assigned_to,
        resolution_notes=payload.resolution_notes,
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Compliance case not found")
    return updated


@router.post("/sar-filing", response_model=SARFilingResponse)
def file_sar_report(
    payload: SARFilingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """File a FinCEN Suspicious Activity Report (SAR) for an escalated case."""
    service = CaseService(db)
    updated = service.update_case(
        case_id=payload.case_id,
        status="CLOSED",
        priority=None,
        assigned_to=payload.officer_name,
        resolution_notes=f"SAR filed: {payload.narrative}",
        decision="sar_filed",
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found for SAR filing")

    import uuid
    from datetime import datetime

    sar_id = f"SAR-{payload.case_id[:6].upper()}-FINCEN"
    return SARFilingResponse(
        sar_reference=sar_id,
        case_id=payload.case_id,
        status="TRANSMITTED_TO_FINCEN",
        filed_at=datetime.utcnow().isoformat(),
        narrative_summary=payload.narrative[:120] + "...",
        regulatory_endpoint="https://bsaefiling.fincen.treas.gov/main.html (Sandbox Simulation)"
    )


@router.post("/travel-rule", response_model=TravelRuleResponse)
def check_fatf_travel_rule(
    payload: TravelRuleRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Verify transaction payload compliance against FATF Recommendation 16 (Travel Rule)."""
    service = CaseService(db)
    return service.validate_travel_rule(payload)
