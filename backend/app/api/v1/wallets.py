from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User, Wallet, AuditEvent
from app.schemas.wallet import WalletCreate, WalletResponse

router = APIRouter(prefix="/wallets", tags=["Wallets"])


@router.post("/", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
def register_wallet(
    request: WalletCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a public wallet address for the current authenticated user."""
    # Check if this address is already registered to this user
    existing = db.query(Wallet).filter(
        Wallet.user_id == current_user.id,
        Wallet.address.ilike(request.address),
    ).first()
    if existing:
        return existing

    wallet = Wallet(
        user_id=current_user.id,
        address=request.address,
        chain_id=request.chain_id,
        label=request.label,
    )
    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="WALLET_REGISTERED",
        entity_type="wallet",
        entity_id=wallet.id,
        metadata_json=f'{{"address": "{wallet.address}", "chain_id": {wallet.chain_id}}}',
    )
    db.add(audit)
    db.commit()

    return wallet


@router.get("/", response_model=List[WalletResponse])
def get_user_wallets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registered wallets for the current user."""
    return db.query(Wallet).filter(Wallet.user_id == current_user.id).all()
