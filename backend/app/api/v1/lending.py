from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.entities import User, AuditEvent
from app.schemas.lending import (
    LendingPositionResponse,
    DepositRequest,
    BorrowRequest,
    RepayRequest,
    WithdrawRequest,
    ActionResponse,
)
from app.services.lending_service import (
    calculate_position,
    execute_deposit,
    execute_borrow,
    execute_repay,
    execute_withdraw,
)

router = APIRouter(prefix="/lending", tags=["Lending & Borrowing"])


@router.get("/position", response_model=LendingPositionResponse)
def get_position(current_user: User = Depends(get_current_user)):
    """Fetch user's current lending position, collateral, LTV, and health factor."""
    return calculate_position(current_user.id)


@router.post("/deposit", response_model=ActionResponse)
def deposit_collateral(
    request: DepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deposit ETH as loan collateral."""
    pos = execute_deposit(current_user.id, request.amount_eth)
    
    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="COLLATERAL_DEPOSITED",
        entity_type="lending_vault",
        metadata_json=f'{{"amount_eth": {request.amount_eth}}}',
    )
    db.add(audit)
    db.commit()

    return ActionResponse(
        success=True,
        message=f"Successfully deposited {request.amount_eth:.4f} ETH collateral.",
        position=pos,
    )


@router.post("/borrow", response_model=ActionResponse)
def borrow_asset(
    request: BorrowRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Borrow USDC against collateral with maximum 75% LTV protection."""
    ok, msg, pos = execute_borrow(current_user.id, request.amount_usdc)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="LOAN_BORROWED",
        entity_type="lending_vault",
        metadata_json=f'{{"amount_usdc": {request.amount_usdc}}}',
    )
    db.add(audit)
    db.commit()

    return ActionResponse(success=True, message=msg, position=pos)


@router.post("/repay", response_model=ActionResponse)
def repay_loan(
    request: RepayRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Repay borrowed USDC debt."""
    pos = execute_repay(current_user.id, request.amount_usdc)
    
    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="LOAN_REPAID",
        entity_type="lending_vault",
        metadata_json=f'{{"amount_usdc": {request.amount_usdc}}}',
    )
    db.add(audit)
    db.commit()

    return ActionResponse(
        success=True,
        message=f"Successfully repaid {request.amount_usdc:,.2f} USDC.",
        position=pos,
    )


@router.post("/withdraw", response_model=ActionResponse)
def withdraw_collateral(
    request: WithdrawRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Withdraw collateral if Health Factor remains safely above liquidation threshold."""
    ok, msg, pos = execute_withdraw(current_user.id, request.amount_eth)
    if not ok:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

    audit = AuditEvent(
        actor_user_id=current_user.id,
        action="COLLATERAL_WITHDRAWN",
        entity_type="lending_vault",
        metadata_json=f'{{"amount_eth": {request.amount_eth}}}',
    )
    db.add(audit)
    db.commit()

    return ActionResponse(success=True, message=msg, position=pos)
