from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User, AuditEvent
from app.schemas.analytics import (
    PortfolioMetricsResponse,
    StressTestRequest,
    StressTestScenarioResult,
)
from app.services.analytics_service import (
    get_portfolio_metrics,
    simulate_stress_scenario,
)
from app.services.lending_service import get_or_create_position

router = APIRouter(prefix="/analytics", tags=["Financial Analytics"])


@router.get("/portfolio", response_model=PortfolioMetricsResponse)
def get_portfolio(current_user: User = Depends(get_current_user)):
    """Fetch user portfolio asset allocations, VaR (95%, 99%), and Max Drawdown."""
    return get_portfolio_metrics()


@router.post("/stress-test", response_model=StressTestScenarioResult)
def run_stress_test(
    request: StressTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Simulate financial shock scenario on collateral assets and calculate
    impact on lending position health and potential liquidation cascades.
    """
    pos = get_or_create_position(current_user.id)
    result = simulate_stress_scenario(
        shock_percent=request.shock_percent,
        scenario_label=request.scenario_label or f"{request.shock_percent}% Shock",
        current_collateral_eth=pos["supplied_eth"],
        current_debt_usdc=pos["borrowed_usdc"],
    )

    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="STRESS_TEST_EXECUTED",
        entity_type="analytics",
        metadata_json=f'{{"shock_percent": {request.shock_percent}, "liquidation_triggered": {str(result.liquidation_triggered).lower()}}}',
    )
    db.add(audit)
    db.commit()

    return result
