import uuid
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    email = f"swap_{uid}@defiguard.io"
    password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "user"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_swap_quote_and_execution(client: TestClient, auth_headers: dict):
    # 1. Fetch liquidity pools
    pools_res = client.get("/api/v1/swap/pools", headers=auth_headers)
    assert pools_res.status_code == 200
    pools = pools_res.json()
    assert len(pools) >= 3
    eth_usdc = next(p for p in pools if p["pool_name"] == "ETH/USDC")
    assert eth_usdc["reserve_a"] == 2500.0

    # 2. Get swap quote for 1.5 ETH to USDC
    quote_res = client.post(
        "/api/v1/swap/quote",
        json={
            "token_in": "ETH",
            "token_out": "USDC",
            "amount_in": 1.5,
            "slippage_tolerance_percent": 0.5,
        },
        headers=auth_headers,
    )
    assert quote_res.status_code == 200
    quote = quote_res.json()
    assert quote["expected_amount_out"] > 4000.0
    assert quote["price_impact_percent"] < 1.0
    assert quote["lp_fee_percent"] == 0.3
    assert quote["constant_product_k"] > 0

    # 3. Execute swap with safe slippage
    exec_res = client.post(
        "/api/v1/swap/execute",
        json={
            "token_in": "ETH",
            "token_out": "USDC",
            "amount_in": 1.5,
            "minimum_amount_out": quote["minimum_amount_out"],
        },
        headers=auth_headers,
    )
    assert exec_res.status_code == 200
    res_data = exec_res.json()
    assert res_data["status"] == "CONFIRMED"
    assert res_data["tx_hash"].startswith("0x")
    assert res_data["amount_out_received"] > 0

    # 4. Swap exceeding slippage limit should be rejected
    fail_res = client.post(
        "/api/v1/swap/execute",
        json={
            "token_in": "ETH",
            "token_out": "USDC",
            "amount_in": 1.0,
            "minimum_amount_out": 999999.0,  # Unrealistic minimum
        },
        headers=auth_headers,
    )
    assert fail_res.status_code == 400
    assert "Slippage limit violated" in fail_res.json()["detail"]


def test_impermanent_loss_simulation(client: TestClient, auth_headers: dict):
    # Simulate 50% price increase of token A (e.g. ETH from $3,000 to $4,500)
    il_res = client.post(
        "/api/v1/swap/impermanent-loss",
        json={"price_change_token_a_percent": 50.0, "price_change_token_b_percent": 0.0},
        headers=auth_headers,
    )
    assert il_res.status_code == 200
    data = il_res.json()
    assert data["impermanent_loss_percent"] > 1.5
    assert data["impermanent_loss_percent"] < 3.0  # Exactly ~2.02% for 1.5x price ratio
    assert data["pool_hold_value_usd"] < data["hoddle_value_usd"]


def test_dydx_perpetuals_risk(client: TestClient, auth_headers: dict):
    # Test 10x Long ETH position at $3,100 entry with $1,000 margin
    dydx_res = client.post(
        "/api/v1/swap/dydx-margin-risk",
        json={
            "position_type": "LONG",
            "entry_price_usd": 3100.0,
            "collateral_usd": 1000.0,
            "leverage": 10.0,
            "maintenance_margin_rate": 0.03,
            "current_funding_rate_8h": 0.0001,
        },
        headers=auth_headers,
    )
    assert dydx_res.status_code == 200
    res = dydx_res.json()
    assert res["position_size_usd"] == 10000.0
    assert res["liquidation_price_usd"] < 3100.0
    assert res["distance_to_liquidation_percent"] < 15.0  # At 10x leverage, ~7-10% distance


def test_duke_protocols_academic_study(client: TestClient, auth_headers: dict):
    res = client.get("/api/v1/swap/duke-protocols", headers=auth_headers)
    assert res.status_code == 200
    protocols = res.json()
    assert len(protocols) == 5
    names = [p["protocol"] for p in protocols]
    assert any("MakerDAO" in n for n in names)
    assert any("Compound" in n for n in names)
    assert any("Aave" in n for n in names)
    assert any("Uniswap" in n for n in names)
    assert any("dYdX" in n for n in names)
