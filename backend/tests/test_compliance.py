import uuid
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    email = f"compliance_{uid}@defiguard.io"
    password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "analyst"},
    )
    assert reg_res.status_code == 201, f"Register failed: {reg_res.text}"

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_compliance_metrics_and_cases(client: TestClient, auth_headers: dict):
    # 1. Metrics check
    resp = client.get("/api/v1/compliance/metrics", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "overall_risk_score" in data
    assert data["overall_risk_score"] == 88.46
    assert data["pending_alerts"] > 0
    assert data["active_cases"] > 0

    # 2. List cases
    resp_cases = client.get("/api/v1/compliance/cases", headers=auth_headers)
    assert resp_cases.status_code == 200
    cases = resp_cases.json()
    assert isinstance(cases, list)
    assert len(cases) >= 5

    # 3. Create a case
    new_case = {
        "target_address": "0x1234567890123456789012345678901234567890",
        "entity_name": "Test Mixer Entity",
        "violation_type": "MIXER_DEPOSIT",
        "priority": "HIGH",
        "risk_score": 92.0,
        "notes": "Direct deposit into unverified privacy pool"
    }
    resp_create = client.post("/api/v1/compliance/cases", json=new_case, headers=auth_headers)
    assert resp_create.status_code == 201
    created_id = resp_create.json()["id"]

    # 4. Update case status
    resp_update = client.patch(
        f"/api/v1/compliance/cases/{created_id}",
        json={"status": "INVESTIGATING", "assigned_to": "Officer Alice"},
        headers=auth_headers
    )
    assert resp_update.status_code == 200
    assert resp_update.json()["status"] == "INVESTIGATING"

    # 5. File SAR
    resp_sar = client.post(
        "/api/v1/compliance/sar-filing",
        json={
            "case_id": created_id,
            "narrative": "Detailed investigation revealed structured deposits evading BSA/AML reporting thresholds.",
            "suspicious_amount_usd": 45000.0,
            "officer_name": "Officer Alice"
        },
        headers=auth_headers
    )
    assert resp_sar.status_code == 200
    assert resp_sar.json()["status"] == "TRANSMITTED_TO_FINCEN"


def test_sanctions_screener(client: TestClient, auth_headers: dict):
    # Test screening
    resp = client.post(
        "/api/v1/compliance/screen",
        json={"query": "Tornado"},
        headers=auth_headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["query"] == "Tornado"
    assert "matches" in data


def test_fatf_travel_rule(client: TestClient, auth_headers: dict):
    # 1. Compliant transfer
    payload_valid = {
        "originator_name": "Alice Nakamoto",
        "originator_address": "0x1111111111111111111111111111111111111111",
        "originator_vasp": "Coinbase Inc",
        "beneficiary_name": "Bob Szabo",
        "beneficiary_address": "0x2222222222222222222222222222222222222222",
        "beneficiary_vasp": "Kraken Exchange",
        "amount_usd": 5000.0,
        "asset_symbol": "USDT"
    }
    resp = client.post("/api/v1/compliance/travel-rule", json=payload_valid, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["is_compliant"] is True
    assert resp.json()["threshold_exceeded"] is True

    # 2. Non-compliant transfer (missing beneficiary VASP and name above $1,000 threshold)
    payload_invalid = {
        "originator_name": "Alice Nakamoto",
        "originator_address": "0x1111111111111111111111111111111111111111",
        "originator_vasp": "Coinbase Inc",
        "beneficiary_name": "",
        "beneficiary_address": "0x2222222222222222222222222222222222222222",
        "beneficiary_vasp": "",
        "amount_usd": 15000.0,
        "asset_symbol": "USDT"
    }
    resp_invalid = client.post("/api/v1/compliance/travel-rule", json=payload_invalid, headers=auth_headers)
    assert resp_invalid.status_code == 200
    assert resp_invalid.json()["is_compliant"] is False
    assert len(resp_invalid.json()["missing_fields"]) > 0
