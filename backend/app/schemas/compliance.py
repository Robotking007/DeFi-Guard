from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScreeningRequest(BaseModel):
    query: str = Field(..., min_length=2, description="Wallet address, person name, or entity name to screen")

class SanctionsMatch(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    aliases: Optional[str] = None
    sanctions: Optional[str] = None
    dataset: Optional[str] = None
    countries: Optional[str] = None
    program_ids: Optional[str] = None
    match_type: str
    severity: str

class ScreeningResponse(BaseModel):
    query: str
    is_sanctioned: bool
    total_matches: int
    matches: List[SanctionsMatch]
    checked_at: str

class ComplianceMetrics(BaseModel):
    overall_risk_score: float
    risk_level: str
    pending_alerts: int
    active_cases: int
    watchlist_matches: int
    sar_filings_count: int
    category_distribution: Dict[str, int]
    priority_distribution: Dict[str, int]

class CaseCreate(BaseModel):
    target_address: str = Field(..., description="Target wallet address")
    entity_name: Optional[str] = None
    violation_type: str = Field(..., description="Type of violation e.g. Sanctions, Structuring, Darknet")
    priority: str = Field(default="HIGH", description="CRITICAL, HIGH, MEDIUM, LOW")
    risk_score: float = Field(default=85.0, ge=0.0, le=100.0)
    notes: Optional[str] = None

class CaseUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, UNDER_REVIEW, SAR_FILED, CLOSED
    priority: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class CaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_number: str
    target_address: str
    entity_name: Optional[str] = None
    violation_type: str
    priority: str
    status: str
    risk_score: float
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    sar_reference: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AlertResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    alert_type: str
    severity: str
    status: str
    title: str
    description: Optional[str] = None
    wallet_address: Optional[str] = None
    created_at: datetime

class SARFilingRequest(BaseModel):
    case_id: str
    narrative: str = Field(..., min_length=20, description="Detailed SAR narrative for regulatory filing")
    suspicious_amount_usd: float = Field(..., ge=0.0)
    officer_name: str = Field(default="Compliance Officer #44")
    jurisdiction: str = Field(default="US-FinCEN")

class SARFilingResponse(BaseModel):
    sar_reference: str
    case_id: str
    status: str
    filed_at: str
    narrative_summary: str
    regulatory_endpoint: str

class TravelRuleRequest(BaseModel):
    originator_name: str
    originator_address: str
    originator_vasp: str
    beneficiary_name: str
    beneficiary_address: str
    beneficiary_vasp: str
    amount_usd: float
    asset_symbol: str = "USDT"

class TravelRuleResponse(BaseModel):
    is_compliant: bool
    threshold_usd: float = 1000.0
    threshold_exceeded: bool
    missing_fields: List[str]
    originator_sanction_check: bool
    beneficiary_sanction_check: bool
    risk_verdict: str
    recommendation: str
