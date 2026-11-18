from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class LendingPositionResponse(BaseModel):
    supplied_collateral_eth: float
    supplied_collateral_usd: float
    borrowed_usdc: float
    collateral_price_usd: float
    ltv_percent: float
    health_factor: float
    liquidation_threshold_percent: float = 80.0
    borrow_power_used_percent: float
    available_to_borrow_usdc: float
    borrow_apr_percent: float = 10.0
    net_worth_usd: float
    credit_score: int = 878
    credit_rating: str = "Excellent"
    collateral_multiplier: float = 1.72
    is_liquidation_risk: bool = False

    model_config = ConfigDict(from_attributes=True)


class DepositRequest(BaseModel):
    amount_eth: float = Field(..., gt=0.0)


class BorrowRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0.0)


class RepayRequest(BaseModel):
    amount_usdc: float = Field(..., gt=0.0)


class WithdrawRequest(BaseModel):
    amount_eth: float = Field(..., gt=0.0)


class ActionResponse(BaseModel):
    success: bool
    message: str
    position: LendingPositionResponse
