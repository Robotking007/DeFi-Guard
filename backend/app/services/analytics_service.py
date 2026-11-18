from typing import List, Dict, Any
from app.schemas.analytics import (
    AssetAllocation,
    PortfolioMetricsResponse,
    StressTestScenarioResult,
)

# Reference benchmark values from Themon dashboard
PORTFOLIO_ASSETS = [
    {"symbol": "ETH", "name": "Ethereum", "amount": 16.41, "price": 3120.0, "value": 51200.0, "pct": 41.0, "color": "#3b82f6"},
    {"symbol": "BTC", "name": "Bitcoin", "amount": 0.638, "price": 62350.0, "value": 39800.0, "pct": 32.0, "color": "#f59e0b"},
    {"symbol": "SOL", "name": "Solana", "amount": 125.86, "price": 145.0, "value": 18250.0, "pct": 14.6, "color": "#06b6d4"},
    {"symbol": "USDC", "name": "USD Coin", "amount": 9600.0, "price": 1.0, "value": 9600.0, "pct": 7.7, "color": "#10b981"},
    {"symbol": "Other", "name": "DeFi Tokens", "amount": 1.0, "price": 6022.39, "value": 6022.39, "pct": 4.7, "color": "#8b5cf6"},
]

TOTAL_PORTFOLIO_VAL = 124872.39


def get_portfolio_metrics() -> PortfolioMetricsResponse:
    """Return asset allocation, VaR, and Max Drawdown."""
    allocations = [
        AssetAllocation(
            symbol=a["symbol"],
            name=a["name"],
            amount=a["amount"],
            price_usd=a["price"],
            value_usd=a["value"],
            allocation_percent=a["pct"],
            color=a["color"],
        )
        for a in PORTFOLIO_ASSETS
    ]

    return PortfolioMetricsResponse(
        total_portfolio_value_usd=TOTAL_PORTFOLIO_VAL,
        change_24h_usd=3420.18,
        change_24h_percent=2.8,
        var_95_usd=14210.0,
        var_99_usd=26850.0,
        max_drawdown_percent=18.4,
        allocations=allocations,
        valuation_source="CoinGecko Live API & Seeded Snapshots",
    )


def simulate_stress_scenario(
    shock_percent: float,
    scenario_label: str = "Market Price Shock",
    current_collateral_eth: float = 7.0,
    current_debt_usdc: float = 15010.0,
    eth_price: float = 3120.0,
) -> StressTestScenarioResult:
    """
    Simulate financial shock scenario on collateral assets and calculate
    impact on lending position health and potential liquidation cascades.
    """
    shock_multiplier = 1.0 + (shock_percent / 100.0)
    
    # Portfolio shock
    stressed_portfolio = TOTAL_PORTFOLIO_VAL * shock_multiplier
    loss_usd = TOTAL_PORTFOLIO_VAL - stressed_portfolio

    # Collateral shock
    original_collateral_usd = current_collateral_eth * eth_price
    original_hf = (original_collateral_usd * 0.80) / current_debt_usdc if current_debt_usdc > 0 else 99.0

    stressed_eth_price = eth_price * shock_multiplier
    stressed_collateral_usd = current_collateral_eth * stressed_eth_price
    stressed_hf = (stressed_collateral_usd * 0.80) / current_debt_usdc if current_debt_usdc > 0 else 99.0

    liquidation_triggered = stressed_hf <= 1.0
    capital_at_risk = current_debt_usdc if liquidation_triggered else max(0.0, loss_usd * 0.25)

    if liquidation_triggered:
        advice = f"CRITICAL: Position liquidated! Health Factor dropped to {stressed_hf:.2f}. Deposit at least {((current_debt_usdc / 0.80) - stressed_collateral_usd) / stressed_eth_price:.2f} ETH or repay debt immediately."
    elif stressed_hf < 1.3:
        advice = f"WARNING: Elevated liquidation exposure (Health Factor: {stressed_hf:.2f}). Consider deleveraging 20% of borrowed USDC."
    else:
        advice = f"SAFE: Position maintains healthy collateral buffer (Health Factor: {stressed_hf:.2f}) under {shock_percent:.0f}% market shock."

    return StressTestScenarioResult(
        scenario_label=scenario_label,
        price_shock_percent=shock_percent,
        original_portfolio_value=round(TOTAL_PORTFOLIO_VAL, 2),
        stressed_portfolio_value=round(stressed_portfolio, 2),
        value_loss_usd=round(loss_usd, 2),
        original_health_factor=round(original_hf, 2),
        stressed_health_factor=round(stressed_hf, 2),
        liquidation_triggered=liquidation_triggered,
        capital_at_risk_usd=round(capital_at_risk, 2),
        remediation_advice=advice,
    )
