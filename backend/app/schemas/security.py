from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class ScanRequest(BaseModel):
    contract_name: str = Field(default="SmartContract.sol", description="Name of the contract")
    source_code: str = Field(..., min_length=20, description="Solidity source code to audit")
    compiler_version: str = Field(default="0.8.24", description="Solidity compiler version")

class FindingItem(BaseModel):
    id: Optional[str] = None
    detector: str
    severity: str  # high, medium, low, informational
    line_number: Optional[int] = None
    description: str
    recommendation: Optional[str] = None

class ScanResponse(BaseModel):
    scan_id: str
    contract_name: str
    source_hash: str
    security_score: int
    score_grade: str  # A, B, C, D, F
    is_safe_to_deploy: bool
    summary: str
    findings_count: Dict[str, int]
    findings: List[FindingItem]
    scanned_at: str
    slither_version: str = "0.11.6"
    solc_version: str = "0.8.24"

class PresetContract(BaseModel):
    id: str
    name: str
    category: str
    description: str
    code: str
