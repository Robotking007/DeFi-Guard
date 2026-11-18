from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Dict, Any

from app.core.security import get_current_user
from app.models.entities import User
from app.schemas.swap import (
    SwapQuoteRequest,
    SwapQuoteResponse,
    SwapExecuteRequest,
    SwapExecuteResponse,
    LiquidityPoolInfo,
    ImpermanentLossRequest,
    ImpermanentLossResponse,
    DyDxPerpRiskRequest,
    DyDxPerpRiskResponse,
    DukeProtocolStudy,
)
from app.services.amm_service import AMMService

router = APIRouter(prefix="/swap", tags=["amm-token-swap"])
_amm = AMMService()


@router.get("/pools", response_model=List[LiquidityPoolInfo])
def get_liquidity_pools(current_user: User = Depends(get_current_user)):
    """Return list of active AMM liquidity pools, reserves, and 24h volumes."""
    return _amm.get_pools()


@router.post("/quote", response_model=SwapQuoteResponse)
def get_swap_quote(
    payload: SwapQuoteRequest,
    current_user: User = Depends(get_current_user),
):
    """Calculate exact token swap quote using constant-product invariant x * y = k."""
    try:
        return _amm.get_swap_quote(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/execute", response_model=SwapExecuteResponse)
def execute_swap(
    payload: SwapExecuteRequest,
    current_user: User = Depends(get_current_user),
):
    """Execute token swap with on-chain slippage guard."""
    try:
        return _amm.execute_swap(payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Swap execution failed: {str(e)}")


@router.post("/impermanent-loss", response_model=ImpermanentLossResponse)
def calculate_impermanent_loss(
    payload: ImpermanentLossRequest,
    current_user: User = Depends(get_current_user),
):
    """Simulate impermanent loss for liquidity providers across divergent asset price movements."""
    return _amm.calculate_impermanent_loss(payload)


@router.post("/dydx-margin-risk", response_model=DyDxPerpRiskResponse)
def calculate_dydx_margin_risk(
    payload: DyDxPerpRiskRequest,
    current_user: User = Depends(get_current_user),
):
    """Simulate dYdX perpetual derivatives margin requirements, liquidation threshold, and funding fees."""
    return _amm.calculate_dydx_margin_risk(payload)


@router.get("/duke-protocols", response_model=List[DukeProtocolStudy])
def get_duke_protocols_academic_study(current_user: User = Depends(get_current_user)):
    """Return deep mathematical and architectural breakdown for the 5 protocols in Duke's DeFi specialization."""
    return _amm.get_duke_protocols_study()
