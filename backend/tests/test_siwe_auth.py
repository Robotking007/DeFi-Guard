from eth_account import Account
from eth_account.messages import encode_defunct


def test_siwe_nonce_generation(client):
    """Test challenge nonce generation for Sign-In with Ethereum."""
    res = client.get("/api/v1/auth/nonce")
    assert res.status_code == 200
    data = res.json()
    assert "nonce" in data
    assert len(data["nonce"]) == 32


def test_siwe_signature_verification(client):
    """Test full EIP-4361 SIWE signature creation, verification, and JWT issuance."""
    # 1. Fetch challenge nonce
    nonce_res = client.get("/api/v1/auth/nonce")
    nonce = nonce_res.json()["nonce"]

    # 2. Simulate client wallet (MetaMask) signing the challenge
    wallet = Account.create()
    message_text = (
        f"defiguard.io wants you to sign in with your Ethereum account:\n"
        f"{wallet.address}\n\n"
        f"Sign in to DeFiGuard Risk & Compliance Platform.\n\n"
        f"URI: https://defiguard.io\n"
        f"Version: 1\n"
        f"Chain ID: 11155111\n"
        f"Nonce: {nonce}\n"
        f"Issued At: 2026-11-18T22:00:00Z"
    )
    encoded = encode_defunct(text=message_text)
    signed = wallet.sign_message(encoded)

    # 3. Submit signature to backend
    verify_payload = {
        "address": wallet.address,
        "message": message_text,
        "signature": signed.signature.hex(),
    }
    verify_res = client.post("/api/v1/auth/siwe/verify", json=verify_payload)
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "user"

    # 4. Use token to access protected endpoint
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/v1/users/me", headers=headers)
    assert me_res.status_code == 200


def test_siwe_invalid_signature_rejected(client):
    """Test that forged or mismatched signatures are rejected."""
    wallet1 = Account.create()
    wallet2 = Account.create()

    message_text = f"Sign in with nonce 123456"
    encoded = encode_defunct(text=message_text)
    signed_by_2 = wallet2.sign_message(encoded)

    # Claiming to be wallet1, but signed by wallet2
    payload = {
        "address": wallet1.address,
        "message": message_text,
        "signature": signed_by_2.signature.hex(),
    }
    res = client.post("/api/v1/auth/siwe/verify", json=payload)
    assert res.status_code == 401


def test_web3auth_login_endpoint(client):
    """Test Web3Auth Sapphire Devnet direct verification endpoint."""
    wallet = Account.create()
    payload = {
        "public_address": wallet.address,
        "email": "user@sapphire.devnet",
    }
    res = client.post("/api/v1/auth/web3auth", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "user"
