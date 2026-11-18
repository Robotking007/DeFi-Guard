from app.models.entities import User, Asset, Wallet, Transaction
from app.core.database import check_db_connection


def test_db_connectivity():
    """Verify that the engine connection check returns True."""
    assert check_db_connection() is True


def test_create_user_and_wallet(db_session):
    """Verify ORM model creation and foreign key relationships."""
    user = User(
        email="test_analyst@defiguard.local",
        password_hash="mock_hash_for_testing",
        role="analyst",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert user.role == "analyst"

    wallet = Wallet(
        user_id=user.id,
        address="0x71C8fb9624647ae2798454BA32074972eA97B01E",
        chain_id=1,
        label="Test Treasury",
    )
    db_session.add(wallet)
    db_session.commit()
    db_session.refresh(wallet)

    assert wallet.id is not None
    assert wallet.user_id == user.id
    assert len(user.wallets) == 1
    assert user.wallets[0].address == "0x71C8fb9624647ae2798454BA32074972eA97B01E"


def test_create_asset_and_transaction(db_session):
    """Verify Asset and Transaction model persistence."""
    eth = Asset(
        symbol="ETH",
        name="Ethereum",
        decimals=18,
        chain_id=1,
    )
    db_session.add(eth)
    db_session.commit()
    db_session.refresh(eth)

    assert eth.id is not None
    assert eth.symbol == "ETH"

    tx = Transaction(
        tx_hash="0x4a5d8b7a6375056f91d579ef64ef817c132890ae1234567890abcdef12345678",
        chain_id=1,
        from_address="0x71C8fb9624647ae2798454BA32074972eA97B01E",
        to_address="0x1111111254fb6c44bac0bed2854e76f90643097d",
        asset_id=eth.id,
        amount=2.5,
        status="completed",
        block_number=19800123,
    )
    db_session.add(tx)
    db_session.commit()
    db_session.refresh(tx)

    assert tx.id is not None
    assert tx.asset.symbol == "ETH"
    assert tx.amount == 2.5
