def test_lending_workflows(client):
    """Test full collateral deposit, borrow with LTV guard, repay, and withdrawal safety."""
    # 1. Login user
    client.post(
        "/api/v1/auth/register",
        json={"email": "lending_user@defiguard.io", "password": "Password123!", "role": "user"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "lending_user@defiguard.io", "password": "Password123!"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # 2. Get initial position
    pos_res = client.get("/api/v1/lending/position", headers=headers)
    assert pos_res.status_code == 200
    pos = pos_res.json()
    assert pos["supplied_collateral_eth"] == 7.0
    assert pos["borrowed_usdc"] == 15010.0
    assert pos["health_factor"] > 1.0  # Moderate healthy state (1.16)
    assert pos["credit_score"] == 878

    # 3. Deposit additional 2 ETH collateral
    dep_res = client.post("/api/v1/lending/deposit", json={"amount_eth": 2.0}, headers=headers)
    assert dep_res.status_code == 200
    pos_after_dep = dep_res.json()["position"]
    assert pos_after_dep["supplied_collateral_eth"] == 9.0
    assert pos_after_dep["health_factor"] > pos["health_factor"]  # Health factor improved!

    # 4. Borrow USDC within safe limit
    borrow_res = client.post("/api/v1/lending/borrow", json={"amount_usdc": 1000.0}, headers=headers)
    assert borrow_res.status_code == 200
    pos_after_borrow = borrow_res.json()["position"]
    assert pos_after_borrow["borrowed_usdc"] == 16010.0

    # 5. Borrow exceeding 75% LTV limit should be rejected
    exceed_res = client.post("/api/v1/lending/borrow", json={"amount_usdc": 100000.0}, headers=headers)
    assert exceed_res.status_code == 400
    assert "LTV limit" in exceed_res.json()["detail"]

    # 6. Repay debt
    repay_res = client.post("/api/v1/lending/repay", json={"amount_usdc": 5000.0}, headers=headers)
    assert repay_res.status_code == 200
    pos_after_repay = repay_res.json()["position"]
    assert pos_after_repay["borrowed_usdc"] == 11010.0

    # 7. Unsafe withdraw triggering liquidation risk should be rejected
    unsafe_withdraw = client.post("/api/v1/lending/withdraw", json={"amount_eth": 8.0}, headers=headers)
    assert unsafe_withdraw.status_code == 400
    assert "liquidation risk" in unsafe_withdraw.json()["detail"]


def test_portfolio_analytics_and_stress_testing(client):
    """Test portfolio VaR, Max Drawdown, and -10%, -25%, -50% stress test scenarios."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "analytics_user@defiguard.io", "password": "Password123!", "role": "user"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "analytics_user@defiguard.io", "password": "Password123!"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    # 1. Fetch portfolio metrics
    port_res = client.get("/api/v1/analytics/portfolio", headers=headers)
    assert port_res.status_code == 200
    metrics = port_res.json()
    assert metrics["total_portfolio_value_usd"] > 100000.0
    assert metrics["var_95_usd"] > 0
    assert metrics["var_99_usd"] > metrics["var_95_usd"]
    assert metrics["max_drawdown_percent"] > 0
    assert len(metrics["allocations"]) >= 4

    # 2. Run -10% market correction scenario (position should stay safe)
    stress_10 = client.post(
        "/api/v1/analytics/stress-test",
        json={"shock_percent": -10.0, "scenario_label": "10% Market Correction"},
        headers=headers,
    )
    assert stress_10.status_code == 200
    res_10 = stress_10.json()
    assert res_10["price_shock_percent"] == -10.0
    assert res_10["liquidation_triggered"] is False

    # 3. Run -50% black swan crash scenario (liquidation should be flagged)
    stress_50 = client.post(
        "/api/v1/analytics/stress-test",
        json={"shock_percent": -50.0, "scenario_label": "50% Black Swan Crash"},
        headers=headers,
    )
    assert stress_50.status_code == 200
    res_50 = stress_50.json()
    assert res_50["price_shock_percent"] == -50.0
    assert res_50["liquidation_triggered"] is True
    assert "CRITICAL" in res_50["remediation_advice"]
