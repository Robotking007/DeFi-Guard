from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User
from app.schemas.governance import (
    ProposalCreate,
    VoteCast,
    ProposalResponse,
    VoteResponse,
)
from app.services.governance_service import GovernanceService

router = APIRouter(prefix="/governance", tags=["dao-governance"])


@router.get("/proposals", response_model=List[ProposalResponse])
def list_proposals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all DAO proposals, voting statistics, and quorum statuses."""
    service = GovernanceService(db)
    return service.list_proposals()


@router.post("/proposals", response_model=ProposalResponse, status_code=status.HTTP_201_CREATED)
def create_proposal(
    payload: ProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new on-chain DAO governance proposal."""
    service = GovernanceService(db)
    return service.create_proposal(payload)


@router.post("/vote", response_model=VoteResponse)
def cast_vote(
    payload: VoteCast,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cast a token-weighted vote on an active proposal."""
    service = GovernanceService(db)
    try:
        return service.cast_vote(payload)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))


@router.post("/proposals/{proposal_id}/execute")
def execute_proposal(
    proposal_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute a passed proposal through the DAO timelock controller."""
    service = GovernanceService(db)
    try:
        return service.execute_proposal(proposal_id)
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
