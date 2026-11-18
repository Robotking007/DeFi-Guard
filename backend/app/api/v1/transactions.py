import math
import random
import uuid
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User, Wallet, Asset, Transaction, RiskAnalysis, Alert
from app.schemas.transaction import (
    TransactionResponse,
    PaginatedTransactions,
    DemoImportResponse,
    LiveSyncRequest,
    LiveSyncResponse,
)
from app.services.blockchain_service import sync_live_wallet_transactions

router = APIRouter(prefix="/transactions", tags=["Transactions"])

# Seeded known addresses for demo scenarios
PRIMARY_DEMO_WALLET = "0x71C8fb9624647ae2798454BA32074972eA97B01E"
UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
AAVE_V3_POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2"
FLAGGED_MIXER_TORNADO = "0xd90e2f925DA726b50C4Ed8D0Fb90Ad053324F31b"
FLAGGED_SANCTIONED_OFAC = "0x1da5821544e25c636c1417ba96ade4cf6d2f9b5a"


@router.get("", response_model=PaginatedTransactions)
@router.get("/", response_model=PaginatedTransactions)
def list_transactions(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=15, ge=1, le=100),
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List, search, and paginate transaction records."""
    query = db.query(Transaction)

    if status:
        query = query.filter(Transaction.status == status)

    if search:
        search_filter = or_(
            Transaction.tx_hash.ilike(f"%{search}%"),
            Transaction.from_address.ilike(f"%{search}%"),
            Transaction.to_address.ilike(f"%{search}%"),
        )
        query = query.filter(search_filter)

    total = query.count()
    offset = (page - 1) * limit
    transactions = (
        query.order_by(Transaction.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items = []
    for tx in transactions:
        asset_symbol = tx.asset.symbol if tx.asset else "ETH"
        
        # Determine risk tag for UI preview
        is_anomaly = False
        risk_score = 12.0
        if tx.to_address.lower() in [FLAGGED_MIXER_TORNADO.lower(), FLAGGED_SANCTIONED_OFAC.lower()]:
            is_anomaly = True
            risk_score = 92.5
        elif float(tx.amount) > 50:
            is_anomaly = True
            risk_score = 78.0

        items.append(
            TransactionResponse(
                id=tx.id,
                tx_hash=tx.tx_hash,
                chain_id=tx.chain_id,
                from_address=tx.from_address,
                to_address=tx.to_address,
                asset_symbol=asset_symbol,
                amount=float(tx.amount),
                timestamp=tx.timestamp,
                status=tx.status,
                block_number=tx.block_number,
                is_anomaly=is_anomaly,
                risk_score=risk_score,
            )
        )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return PaginatedTransactions(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/{id}", response_model=TransactionResponse)
def get_transaction(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve single transaction record by UUID."""
    tx = db.query(Transaction).filter(Transaction.id == id).first()
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction record not found.",
        )

    asset_symbol = tx.asset.symbol if tx.asset else "ETH"
    return TransactionResponse(
        id=tx.id,
        tx_hash=tx.tx_hash,
        chain_id=tx.chain_id,
        from_address=tx.from_address,
        to_address=tx.to_address,
        asset_symbol=asset_symbol,
        amount=float(tx.amount),
        timestamp=tx.timestamp,
        status=tx.status,
        block_number=tx.block_number,
        is_anomaly=float(tx.amount) > 50 or tx.to_address.lower() in [FLAGGED_MIXER_TORNADO.lower(), FLAGGED_SANCTIONED_OFAC.lower()],
        risk_score=92.0 if tx.to_address.lower() in [FLAGGED_MIXER_TORNADO.lower(), FLAGGED_SANCTIONED_OFAC.lower()] else 15.0,
    )


@router.post("/import-demo", response_model=DemoImportResponse)
@router.post("/import-demo/", response_model=DemoImportResponse)
def import_demo_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Seed a reproducible dataset of synthetic DeFi transactions containing
    ordinary user activity alongside calibrated anomaly & compliance risk patterns.
    """
    # 1. Ensure assets exist
    assets = {
        "ETH": db.query(Asset).filter(Asset.symbol == "ETH").first(),
        "USDC": db.query(Asset).filter(Asset.symbol == "USDC").first(),
        "WBTC": db.query(Asset).filter(Asset.symbol == "WBTC").first(),
    }

    if not assets["ETH"]:
        eth = Asset(symbol="ETH", name="Ethereum", decimals=18, chain_id=11155111)
        db.add(eth)
        db.flush()
        assets["ETH"] = eth

    if not assets["USDC"]:
        usdc = Asset(symbol="USDC", name="USD Coin", decimals=6, chain_id=11155111)
        db.add(usdc)
        db.flush()
        assets["USDC"] = usdc

    if not assets["WBTC"]:
        wbtc = Asset(symbol="WBTC", name="Wrapped Bitcoin", decimals=8, chain_id=11155111)
        db.add(wbtc)
        db.flush()
        assets["WBTC"] = wbtc

    # 2. Ensure user has a demo wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        wallet = Wallet(
            user_id=current_user.id,
            address=PRIMARY_DEMO_WALLET,
            chain_id=11155111,
            label="Primary Demo Treasury",
        )
        db.add(wallet)
        db.flush()

    # Clear existing demo transactions to maintain deterministic reproducibility
    db.query(Transaction).filter(Transaction.wallet_id == wallet.id).delete()
    db.commit()

    now = datetime.utcnow()
    inserted_records = []
    normal_count = 0
    anomalous_count = 0

    # A. 25 Normal retail and DeFi trades
    for i in range(25):
        time_offset = timedelta(hours=i * 2, minutes=random.randint(5, 55))
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:30]}"
        asset = random.choice([assets["ETH"], assets["USDC"], assets["WBTC"]])
        
        if asset.symbol == "ETH":
            amount = round(random.uniform(0.15, 3.5), 4)
        elif asset.symbol == "USDC":
            amount = round(random.uniform(200.0, 5000.0), 2)
        else:
            amount = round(random.uniform(0.01, 0.25), 5)

        tx = Transaction(
            wallet_id=wallet.id,
            tx_hash=tx_hash,
            chain_id=11155111,
            from_address=wallet.address if i % 2 == 0 else UNISWAP_V3_ROUTER,
            to_address=AAVE_V3_POOL if i % 2 == 0 else wallet.address,
            asset_id=asset.id,
            amount=amount,
            timestamp=now - time_offset,
            status="completed",
            block_number=12160000 + i * 20,
        )
        db.add(tx)
        normal_count += 1

    # B. 5 High-Value Outlier Anomalies (Burst Outflow)
    for i in range(5):
        time_offset = timedelta(hours=1, minutes=i * 3)  # Burst within same hour
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:30]}"
        tx = Transaction(
            wallet_id=wallet.id,
            tx_hash=tx_hash,
            chain_id=11155111,
            from_address=wallet.address,
            to_address=f"0x{uuid.uuid4().hex[:40]}",
            asset_id=assets["ETH"].id,
            amount=round(random.uniform(45.0, 120.0), 2),  # Huge spike
            timestamp=now - time_offset,
            status="completed",
            block_number=12162500 + i,
        )
        db.add(tx)
        anomalous_count += 1

    # C. 3 OFAC / Sanctions Flagged Counterparty Transactions
    flagged_recipients = [
        (FLAGGED_MIXER_TORNADO, assets["ETH"], 10.0),
        (FLAGGED_SANCTIONED_OFAC, assets["USDC"], 25000.0),
        (FLAGGED_MIXER_TORNADO, assets["ETH"], 5.0),
    ]

    for dest, asset, amt in flagged_recipients:
        tx_hash = f"0x{uuid.uuid4().hex}{uuid.uuid4().hex[:30]}"
        tx = Transaction(
            wallet_id=wallet.id,
            tx_hash=tx_hash,
            chain_id=11155111,
            from_address=wallet.address,
            to_address=dest,
            asset_id=asset.id,
            amount=amt,
            timestamp=now - timedelta(minutes=random.randint(10, 120)),
            status="completed",
            block_number=12162600,
        )
        db.add(tx)
        anomalous_count += 1

    db.commit()

    return DemoImportResponse(
        message="Demo transaction dataset loaded successfully.",
        inserted_count=normal_count + anomalous_count,
        normal_count=normal_count,
        anomalous_count=anomalous_count,
    )


@router.post("/sync-live", response_model=LiveSyncResponse)
@router.post("/sync-live/", response_model=LiveSyncResponse)
async def sync_live_transactions(
    req: LiveSyncRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Query real live on-chain transactions via Etherscan V2 API & Alchemy RPC
    for any Ethereum or Sepolia address, persist to DB, and evaluate via
    the 10k-trained ML Anomaly Risk Engine.
    """
    result = await sync_live_wallet_transactions(
        address=req.address,
        chain_id=req.chain_id,
        user=current_user,
        db=db,
        limit=req.limit,
    )
    return LiveSyncResponse(**result)

