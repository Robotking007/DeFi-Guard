from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any

class SwapQuoteRequest(BaseModel):
    token_in: str = Field(..., description="Symbol of token being swapped in e.g. ETH, USDC, WBTC, DAI")
    token_out: str = Field(..., description="Symbol of token being swapped out")
    amount_in: float = Field(..., gt=0.0, description="Amount of token_in to swap")
    slippage_tolerance_percent: float = Field(default=0.5, ge=0.01, le=50.0)

class SwapQuoteResponse(BaseModel):
    token_in: str
    token_out: str
    amount_in: float
    expected_amount_out: float
    minimum_amount_out: float
    execution_price: float
    price_impact_percent: float
    lp_fee_amount: float
    lp_fee_percent: float = 0.3
    pool_reserves_in: float
    pool_reserves_out: float
    constant_product_k: float

class SwapExecuteRequest(BaseModel):
    token_in: str
    token_out: str
    amount_in: float
    minimum_amount_out: float
    recipient_address: Optional[str] = None

class SwapExecuteResponse(BaseModel):
    tx_hash: str
    token_in: str
    token_out: str
    amount_in: float
    amount_out_received: float
    effective_rate: float
    timestamp: str
    status: str = "CONFIRMED"

class AddLiquidityRequest(BaseModel):
    pool_name: str  # e.g. "ETH/USDC"
    amount_token_a: float = Field(..., gt=0.0)
    amount_token_b: float = Field(..., gt=0.0)

class LiquidityPoolInfo(BaseModel):
    pool_name: str
    token_a: str
    token_b: str
    reserve_a: float
    reserve_b: float
    total_liquidity_usd: float
    fee_tier_percent: float
    volume_24h_usd: float
    apy_percent: float

class ImpermanentLossRequest(BaseModel):
    price_change_token_a_percent: float = Field(..., description="Percentage change in price of token A e.g. 50% for 1.5x")
    price_change_token_b_percent: float = Field(default=0.0, description="Percentage change in price of token B")

class ImpermanentLossResponse(BaseModel):
    price_ratio_k: float
    impermanent_loss_percent: float
    pool_hold_value_usd: float
    hoddle_value_usd: float
    net_difference_usd: float
    explanation: str

class DyDxPerpRiskRequest(BaseModel):
    position_type: str = Field(default="LONG", description="LONG or SHORT")
    entry_price_usd: float = Field(..., gt=0.0)
    collateral_usd: float = Field(..., gt=0.0)
    leverage: float = Field(default=5.0, ge=1.0, le=25.0)
    maintenance_margin_rate: float = Field(default=0.03, description="3% MMR for ETH/USD")
    current_funding_rate_8h: float = Field(default=0.0001, description="8h funding rate")

class DyDxPerpRiskResponse(BaseModel):
    position_type: str
    position_size_usd: float
    leverage: float
    initial_margin_usd: float
    maintenance_margin_usd: float
    liquidation_price_usd: float
    distance_to_liquidation_percent: float
    est_funding_fee_daily_usd: float
    risk_level: str
    remediation_advice: str

class DukeProtocolStudy(BaseModel):
    protocol: str
    duke_module: str
    core_mechanism: str
    math_formula: str
    key_parameters: Dict[str, Any]
    live_risk_implications: str
