from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ContributingSignal(BaseModel):
    code: str
    label: str
    weight: float
    description: Optional[str] = None


class RiskAnalysisResponse(BaseModel):
    analysis_id: str
    subject_type: str  # "transaction" or "wallet"
    subject_id: str
    score: float = Field(..., ge=0.0, le=100.0)
    risk_band: str  # "low", "medium", "high", "critical"
    is_fraud_probability: bool = False
    model_name: str
    model_version: str
    signals: List[ContributingSignal]
    disclaimer: str = "Anomaly indicator for academic review; not proof of financial crime or fraud."
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RiskAnalyzeRequest(BaseModel):
    transaction_id: Optional[str] = None
    wallet_address: Optional[str] = None


class RiskOverviewStats(BaseModel):
    total_transactions_analyzed: int
    flagged_anomalies: int
    high_risk_wallets: int
    critical_alerts: int
    average_risk_score: float
    anomaly_rate_percent: float
    model_status: str
    model_version: str
    last_updated: datetime
