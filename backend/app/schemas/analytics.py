from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class AssetAllocation(BaseModel):
    symbol: str
    name: str
    amount: float
    price_usd: float
    value_usd: float
    allocation_percent: float
    color: str


class PortfolioMetricsResponse(BaseModel):
    total_portfolio_value_usd: float
    change_24h_usd: float
    change_24h_percent: float
    var_95_usd: float
    var_99_usd: float
    max_drawdown_percent: float
    allocations: List[AssetAllocation]
    valuation_source: str = "CoinGecko & Live EVM RPC"

    model_config = ConfigDict(from_attributes=True)


class StressTestRequest(BaseModel):
    shock_percent: float = Field(..., ge=-90.0, le=50.0)  # e.g. -10, -25, -50
    scenario_label: Optional[str] = "Market Price Shock"


class StressTestScenarioResult(BaseModel):
    scenario_label: str
    price_shock_percent: float
    original_portfolio_value: float
    stressed_portfolio_value: float
    value_loss_usd: float
    original_health_factor: float
    stressed_health_factor: float
    liquidation_triggered: bool
    capital_at_risk_usd: float
    remediation_advice: str
