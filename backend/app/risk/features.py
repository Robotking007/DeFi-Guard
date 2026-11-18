from datetime import datetime, timedelta
from typing import Dict, Any, List
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.entities import Transaction, Wallet, Asset
from app.compliance.sanctions_engine import sanctions_indexer

# Static fallback token prices in USD
PRICE_MAP = {
    "ETH": 3120.0,
    "BTC": 62400.0,
    "USDC": 1.0,
    "WBTC": 62400.0,
    "SOL": 145.0,
}


def extract_features_for_transaction(tx: Transaction, db: Session) -> Dict[str, float]:
    """
    Extract deterministic, time-window bounded features for a specific transaction
    preventing lookahead bias / data leakage.
    """
    asset_symbol = tx.asset.symbol if tx.asset else "ETH"
    token_price = PRICE_MAP.get(asset_symbol, 1.0)
    value_usd = float(tx.amount) * token_price

    # Historical context prior to this transaction
    prior_txs = (
        db.query(Transaction)
        .filter(
            Transaction.from_address == tx.from_address,
            Transaction.timestamp < tx.timestamp,
        )
        .order_by(Transaction.timestamp.desc())
        .limit(100)
        .all()
    )

    prior_amounts = [float(p.amount) * PRICE_MAP.get(p.asset.symbol if p.asset else "ETH", 1.0) for p in prior_txs]

    # 1. Value Z-score
    if len(prior_amounts) >= 3:
        mean_val = np.mean(prior_amounts)
        std_val = np.std(prior_amounts)
        value_zscore = float((value_usd - mean_val) / (std_val + 1e-6))
    else:
        value_zscore = 0.0

    # 2. Activity in preceding 1 hour and 24 hours
    one_hour_ago = tx.timestamp - timedelta(hours=1)
    twenty_four_hours_ago = tx.timestamp - timedelta(hours=24)

    tx_count_1h = sum(1 for p in prior_txs if p.timestamp >= one_hour_ago)
    tx_count_24h = sum(1 for p in prior_txs if p.timestamp >= twenty_four_hours_ago)

    # 3. Unique counterparties in preceding 24h
    unique_counterparties_24h = len(
        set(p.to_address for p in prior_txs if p.timestamp >= twenty_four_hours_ago)
    )

    # 4. Burst count (preceding 10 minutes)
    ten_min_ago = tx.timestamp - timedelta(minutes=10)
    burst_count = sum(1 for p in prior_txs if p.timestamp >= ten_min_ago)

    # 5. Sanctions / Watchlist match
    sanctions_matches = sanctions_indexer.screen_address_or_name(tx.to_address)
    sanctions_flag = 1.0 if len(sanctions_matches) > 0 else 0.0

    return {
        "value_usd": float(value_usd),
        "value_zscore": float(value_zscore),
        "tx_count_1h": float(tx_count_1h),
        "tx_count_24h": float(tx_count_24h),
        "unique_counterparties_24h": float(unique_counterparties_24h),
        "burst_count": float(burst_count),
        "sanctions_flag": float(sanctions_flag),
    }
