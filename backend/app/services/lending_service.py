from typing import Dict, Any, Tuple
from app.schemas.lending import LendingPositionResponse

# In-memory prototype state per session with realistic Crediflex initial balances
# (Initial values match Crediflex UI benchmark: Supplied 7.00 WETH, Borrowed 15,010 USDC)
DEFAULT_ETH_PRICE = 3120.0
LIQUIDATION_THRESHOLD = 0.80  # 80%
MAX_LTV = 0.75  # 75%

_user_positions: Dict[str, Dict[str, float]] = {}


def get_or_create_position(user_id: str) -> Dict[str, float]:
    """Retrieve or initialize lending position for user."""
    if user_id not in _user_positions:
        _user_positions[user_id] = {
            "supplied_eth": 7.00,
            "borrowed_usdc": 15010.0,
            "credit_score": 878,
        }
    return _user_positions[user_id]


def calculate_position(user_id: str, eth_price: float = DEFAULT_ETH_PRICE) -> LendingPositionResponse:
    """Compute mathematical LTV, Health Factor, and borrow availability."""
    pos = get_or_create_position(user_id)
    supplied_eth = pos["supplied_eth"]
    borrowed_usdc = pos["borrowed_usdc"]

    collateral_usd = supplied_eth * eth_price

    if collateral_usd > 0:
        ltv = (borrowed_usdc / collateral_usd) * 100.0
    else:
        ltv = 0.0

    if borrowed_usdc > 0:
        health_factor = (collateral_usd * LIQUIDATION_THRESHOLD) / borrowed_usdc
    else:
        health_factor = 99.0  # Safe no-debt representation

    max_borrow = collateral_usd * MAX_LTV
    available_to_borrow = max(0.0, max_borrow - borrowed_usdc)
    borrow_power_used = (borrowed_usdc / max_borrow * 100.0) if max_borrow > 0 else 0.0
    net_worth = collateral_usd - borrowed_usdc

    is_liquidation_risk = health_factor <= 1.05

    return LendingPositionResponse(
        supplied_collateral_eth=round(supplied_eth, 4),
        supplied_collateral_usd=round(collateral_usd, 2),
        borrowed_usdc=round(borrowed_usdc, 2),
        collateral_price_usd=round(eth_price, 2),
        ltv_percent=round(ltv, 2),
        health_factor=round(health_factor, 2),
        liquidation_threshold_percent=80.0,
        borrow_power_used_percent=round(min(borrow_power_used, 100.0), 1),
        available_to_borrow_usdc=round(available_to_borrow, 2),
        borrow_apr_percent=10.0,
        net_worth_usd=round(net_worth, 2),
        credit_score=pos["credit_score"],
        credit_rating="Excellent",
        collateral_multiplier=1.72,
        is_liquidation_risk=is_liquidation_risk,
    )


def execute_deposit(user_id: str, amount_eth: float) -> LendingPositionResponse:
    """Deposit ETH as collateral."""
    pos = get_or_create_position(user_id)
    pos["supplied_eth"] += amount_eth
    return calculate_position(user_id)


def execute_borrow(user_id: str, amount_usdc: float) -> Tuple[bool, str, LendingPositionResponse]:
    """Borrow USDC against supplied collateral with LTV cap validation."""
    pos = get_or_create_position(user_id)
    collateral_usd = pos["supplied_eth"] * DEFAULT_ETH_PRICE
    max_borrow = collateral_usd * MAX_LTV
    current_borrow = pos["borrowed_usdc"]

    if current_borrow + amount_usdc > max_borrow:
        excess = (current_borrow + amount_usdc) - max_borrow
        return False, f"Borrow exceeds maximum 75% LTV limit by ${excess:,.2f} USDC.", calculate_position(user_id)

    pos["borrowed_usdc"] += amount_usdc
    return True, f"Successfully borrowed {amount_usdc:,.2f} USDC.", calculate_position(user_id)


def execute_repay(user_id: str, amount_usdc: float) -> LendingPositionResponse:
    """Repay borrowed USDC debt."""
    pos = get_or_create_position(user_id)
    repay_actual = min(pos["borrowed_usdc"], amount_usdc)
    pos["borrowed_usdc"] -= repay_actual
    return calculate_position(user_id)


def execute_withdraw(user_id: str, amount_eth: float) -> Tuple[bool, str, LendingPositionResponse]:
    """Withdraw collateral if Health Factor remains safely above liquidation threshold."""
    pos = get_or_create_position(user_id)
    if amount_eth > pos["supplied_eth"]:
        return False, "Cannot withdraw more collateral than currently supplied.", calculate_position(user_id)

    new_collateral_usd = (pos["supplied_eth"] - amount_eth) * DEFAULT_ETH_PRICE
    if pos["borrowed_usdc"] > 0:
        new_health_factor = (new_collateral_usd * LIQUIDATION_THRESHOLD) / pos["borrowed_usdc"]
        if new_health_factor < 1.05:
            return False, f"Withdrawal would trigger liquidation risk (Health Factor would drop to {new_health_factor:.2f}).", calculate_position(user_id)

    pos["supplied_eth"] -= amount_eth
    return True, f"Successfully withdrawn {amount_eth:.4f} ETH.", calculate_position(user_id)
