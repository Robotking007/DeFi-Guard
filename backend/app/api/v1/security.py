from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User
from app.schemas.security import (
    ScanRequest,
    ScanResponse,
    PresetContract,
)
from app.services.scanner_service import ScannerService

router = APIRouter(prefix="/security", tags=["smart-contract-security"])


@router.get("/presets", response_model=List[PresetContract])
def get_contract_presets(current_user: User = Depends(get_current_user)):
    """Return pre-built educational Solidity contracts for 1-click audit demonstrations."""
    service = ScannerService(None)
    return service.get_presets()


from pydantic import BaseModel
from app.services.gemini_service import gemini_ai

class ExplainFindingRequest(BaseModel):
    detector: str
    code_snippet: str

class ExplainFindingResponse(BaseModel):
    explanation: str
    detector: str


@router.post("/scan", response_model=ScanResponse)
def run_contract_security_scan(
    payload: ScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run Slither static analysis and AST heuristic inspection on submitted Solidity code."""
    service = ScannerService(db)
    return service.run_slither_scan(payload)


@router.post("/explain-finding", response_model=ExplainFindingResponse)
@router.post("/explain-finding/", response_model=ExplainFindingResponse)
def explain_finding_with_gemini(
    payload: ExplainFindingRequest,
    current_user: User = Depends(get_current_user),
):
    """Use Google Gemini 2.0 / Flash Generative AI to generate in-depth audit remediation."""
    explanation = gemini_ai.explain_smart_contract_finding(
        detector=payload.detector,
        code_snippet=payload.code_snippet
    )
    return ExplainFindingResponse(explanation=explanation, detector=payload.detector)


