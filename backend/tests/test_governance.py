import uuid
import pytest
from fastapi.testclient import TestClient

@pytest.fixture
def auth_headers(client: TestClient):
    uid = uuid.uuid4().hex[:6]
    email = f"gov_{uid}@defiguard.io"
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


def test_governance_proposals_and_voting(client: TestClient, auth_headers: dict):
    # 1. List proposals
    list_res = client.get("/api/v1/governance/proposals", headers=auth_headers)
    assert list_res.status_code == 200
    proposals = list_res.json()
    assert len(proposals) >= 3
    first_prop = proposals[0]
    assert first_prop["total_votes"] > 0

    # 2. Create proposal
    create_res = client.post(
        "/api/v1/governance/proposals",
        json={
            "title": "DIP-99: Test DAO Proposal",
            "description": "Integration test proposal to verify democratic quorum validation and voting power.",
            "proposer_wallet": "0x1111111111111111111111111111111111111111",
            "duration_days": 3,
        },
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["title"] == "DIP-99: Test DAO Proposal"

    # 3. Cast Vote
    vote_res = client.post(
        "/api/v1/governance/vote",
        json={
            "proposal_id": created["id"],
            "voter_wallet": "0x2222222222222222222222222222222222222222",
            "choice": "for",
            "voting_power": 5000.0,
        },
        headers=auth_headers,
    )
    assert vote_res.status_code == 200
    vote_data = vote_res.json()
    assert vote_data["voting_power"] == 5000.0
    assert vote_data["choice"] == "for"

    # 4. Execute proposal
    exec_res = client.post(f"/api/v1/governance/proposals/{created['id']}/execute", headers=auth_headers)
    assert exec_res.status_code == 200
    assert exec_res.json()["status"] == "EXECUTED"
