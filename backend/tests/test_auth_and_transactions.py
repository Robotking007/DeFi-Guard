def test_register_and_login(client):
    """Test user registration, duplicate prevention, and login token generation."""
    # Register new user
    register_payload = {
        "email": "analyst@defiguard.io",
        "password": "Password123!",
        "role": "analyst",
    }
    res = client.post("/api/v1/auth/register", json=register_payload)
    assert res.status_code == 201
    user_data = res.json()
    assert user_data["email"] == "analyst@defiguard.io"
    assert user_data["role"] == "analyst"

    # Duplicate registration should fail
    dup_res = client.post("/api/v1/auth/register", json=register_payload)
    assert dup_res.status_code == 400

    # Login
    login_payload = {
        "email": "analyst@defiguard.io",
        "password": "Password123!",
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "analyst"

    # Access protected /users/me
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "analyst@defiguard.io"


def test_wallet_and_demo_transactions(client):
    """Test registering wallet and importing reproducible demo transaction stream."""
    # Register and login a user
    client.post(
        "/api/v1/auth/register",
        json={"email": "trader@defiguard.io", "password": "Password123!", "role": "user"},
    )
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": "trader@defiguard.io", "password": "Password123!"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register wallet
    wallet_payload = {
        "address": "0x71C8fb9624647ae2798454BA32074972eA97B01E",
        "chain_id": 11155111,
        "label": "Demo Sepolia Wallet",
    }
    w_res = client.post("/api/v1/wallets/", json=wallet_payload, headers=headers)
    assert w_res.status_code == 201
    assert w_res.json()["address"] == "0x71C8fb9624647ae2798454BA32074972eA97B01E"

    # Import demo transactions
    import_res = client.post("/api/v1/transactions/import-demo", headers=headers)
    assert import_res.status_code == 200
    import_data = import_res.json()
    assert import_data["inserted_count"] == 33
    assert import_data["normal_count"] == 25
    assert import_data["anomalous_count"] == 8

    # Query paginated transactions
    list_res = client.get("/api/v1/transactions/?page=1&limit=10", headers=headers)
    assert list_res.status_code == 200
    tx_page = list_res.json()
    assert tx_page["total"] == 33
    assert len(tx_page["items"]) == 10
    assert tx_page["total_pages"] == 4
