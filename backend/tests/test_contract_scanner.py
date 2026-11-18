import uuid
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    email = f"security_{uid}@defiguard.io"
    password = "Password123!"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "role": "analyst"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_contract_presets(client: TestClient, auth_headers: dict):
    res = client.get("/api/v1/security/presets", headers=auth_headers)
    assert res.status_code == 200
    presets = res.json()
    assert len(presets) >= 3
    ids = [p["id"] for p in presets]
    assert "reentrancy_vault" in ids
    assert "secure_guarded_vault" in ids


def test_vulnerable_reentrancy_scan(client: TestClient, auth_headers: dict):
    # Fetch reentrancy preset
    presets_res = client.get("/api/v1/security/presets", headers=auth_headers)
    vulnerable_preset = next(p for p in presets_res.json() if p["id"] == "reentrancy_vault")

    # Run scan
    scan_res = client.post(
        "/api/v1/security/scan",
        json={
            "contract_name": vulnerable_preset["name"],
            "source_code": vulnerable_preset["code"],
            "compiler_version": "0.8.24",
        },
        headers=auth_headers,
    )
    assert scan_res.status_code == 200
    data = scan_res.json()
    assert data["security_score"] < 80  # Should be penalized for reentrancy
    assert data["is_safe_to_deploy"] is False
    assert data["findings_count"]["high"] >= 1
    detectors = [f["detector"] for f in data["findings"]]
    assert any("reentrancy" in d.lower() for d in detectors)


def test_secure_vault_scan(client: TestClient, auth_headers: dict):
    # Fetch secure preset
    presets_res = client.get("/api/v1/security/presets", headers=auth_headers)
    secure_preset = next(p for p in presets_res.json() if p["id"] == "secure_guarded_vault")

    # Run scan
    scan_res = client.post(
        "/api/v1/security/scan",
        json={
            "contract_name": secure_preset["name"],
            "source_code": secure_preset["code"],
            "compiler_version": "0.8.24",
        },
        headers=auth_headers,
    )
    assert scan_res.status_code == 200
    data = scan_res.json()
    assert data["security_score"] >= 90  # Grade A
    assert data["is_safe_to_deploy"] is True
    assert data["findings_count"]["high"] == 0
