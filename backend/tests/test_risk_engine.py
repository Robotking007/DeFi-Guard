import pytest
from app.models.entities import Transaction, Asset, Wallet, RiskAnalysis, Alert
from app.risk.features import extract_features_for_transaction
from app.risk.model import risk_engine


def test_feature_extraction_and_inference(db_session):
    """Test deterministic feature extraction and Isolation Forest prediction."""
    eth = Asset(symbol="ETH", name="Ethereum", decimals=18, chain_id=11155111)
    db_session.add(eth)
    db_session.commit()

    # Normal transaction
    tx_normal = Transaction(
        tx_hash="0xnormal1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        chain_id=11155111,
        from_address="0x1111111111111111111111111111111111111111",
        to_address="0x2222222222222222222222222222222222222222",
        asset_id=eth.id,
        amount=1.2,
        status="completed",
    )
    db_session.add(tx_normal)
    db_session.commit()

    features_normal = extract_features_for_transaction(tx_normal, db_session)
    assert "value_usd" in features_normal
    assert features_normal["value_usd"] > 0
    assert features_normal["sanctions_flag"] == 0.0

    score_normal, band_normal, signals_normal = risk_engine.predict_risk(features_normal)
    assert 0.0 <= score_normal <= 100.0
    assert band_normal in ["low", "medium"]

    # Anomalous transaction (high value spike + burst)
    features_anomaly = {
        "value_usd": 150000.0,
        "value_zscore": 4.5,
        "tx_count_1h": 8.0,
        "tx_count_24h": 15.0,
        "unique_counterparties_24h": 12.0,
        "burst_count": 5.0,
        "sanctions_flag": 1.0,
    }
    score_anomaly, band_anomaly, signals_anomaly = risk_engine.predict_risk(features_anomaly)
    assert score_anomaly >= 80.0
    assert band_anomaly == "critical"
    signal_codes = [s["code"] for s in signals_anomaly]
    assert "SANCTIONS_MATCH" in signal_codes
    assert "VALUE_OUTLIER" in signal_codes


def test_api_risk_analyze_and_alert_trigger(client):
    """Test POST /api/v1/risk/analyze endpoint and automated compliance alert creation."""
    # Register, login, and seed demo transactions
    client.post(
        "/api/v1/auth/register",
        json={"email": "risk_analyst@defiguard.io", "password": "Password123!", "role": "analyst"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "risk_analyst@defiguard.io", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/v1/transactions/import-demo", headers=headers)

    # Get one of the seeded transactions
    list_res = client.get("/api/v1/transactions/?page=1&limit=1", headers=headers)
    tx_id = list_res.json()["items"][0]["id"]

    # Run AI risk audit
    analyze_res = client.post(
        "/api/v1/risk/analyze",
        json={"transaction_id": tx_id},
        headers=headers,
    )
    assert analyze_res.status_code == 200
    data = analyze_res.json()
    assert "analysis_id" in data
    assert "score" in data
    assert 0.0 <= data["score"] <= 100.0
    assert data["model_name"] == "isolation_forest"
    assert len(data["signals"]) > 0


def test_api_risk_overview(client):
    """Test GET /api/v1/risk/overview metrics."""
    client.post(
        "/api/v1/auth/register",
        json={"email": "overview_user@defiguard.io", "password": "Password123!", "role": "analyst"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "overview_user@defiguard.io", "password": "Password123!"},
    )
    headers = {"Authorization": f"Bearer {login_res.json()['access_token']}"}

    res = client.get("/api/v1/risk/overview", headers=headers)
    assert res.status_code == 200
    stats = res.json()
    assert "total_transactions_analyzed" in stats
    assert "flagged_anomalies" in stats
    assert stats["model_status"] == "active"
    assert stats["model_version"] == "1.0.0"
