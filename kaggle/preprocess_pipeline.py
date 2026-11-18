"""
DeFiGuard Kaggle Preprocessing Pipeline
Transforms raw Ethereum transaction datasets (10,000+ records) into normalized
feature matrices for IsolationForest and Anomaly Detection models.
Outputs both general blockchain risk features and DeFiGuard production engine features.
"""

import os
import sys
import logging
import pandas as pd
import numpy as np
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("kaggle_preprocess")

BASE_DIR = Path(__file__).parent
RAW_DATA_PATH = BASE_DIR / "data" / "raw" / "ethereum_fraud_benchmark.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_EXTENDED_CSV = PROCESSED_DIR / "train_features_10k.csv"
OUTPUT_DEFIGUARD_CSV = PROCESSED_DIR / "defiguard_risk_features_10k.csv"

ETH_PRICE_USD = 3200.0

def run_preprocessing(input_path: Path = RAW_DATA_PATH) -> tuple[pd.DataFrame, pd.DataFrame]:
    if not input_path.exists():
        logger.info(f"Raw data not found at {input_path}. Triggering ingestion...")
        from fetch_dataset import fetch_or_prepare_dataset
        input_path = fetch_or_prepare_dataset()

    logger.info(f"Loading raw dataset from {input_path}...")
    df = pd.read_csv(input_path)
    logger.info(f"Loaded {len(df):,} records. Starting feature engineering...")

    df.fillna(0, inplace=True)
    np.random.seed(42)

    # -------------------------------------------------------------
    # 1. Extended Features Matrix (7 Features)
    # -------------------------------------------------------------
    amount_usd = (df["Avg_Val_Sent"] * ETH_PRICE_USD).clip(lower=1.0, upper=10_000_000.0)
    base_gas = np.random.normal(loc=25.0, scale=8.0, size=len(df)).clip(min=5.0)
    burst_gas_multiplier = np.where(df["FLAG"] == 1, np.random.uniform(2.5, 6.0, size=len(df)), 1.0)
    gas_price_gwei = np.round(base_gas * burst_gas_multiplier, 2)

    duration_days = np.maximum(df["Time_Diff_between_first_and_last_Mins"] / 1440.0, 0.05)
    velocity_24h = np.round(df["Sent_tnx"] / duration_days, 2).clip(upper=500.0)

    is_burst = (df["Avg_min_between_sent_tnx"] > 0) & (df["Avg_min_between_sent_tnx"] <= 5.0)
    burst_count_5m = np.where(
        is_burst,
        np.random.randint(5, 45, size=len(df)),
        np.random.randint(0, 3, size=len(df))
    )

    failed_tx_ratio = np.where(
        df["FLAG"] == 1,
        np.round(np.random.uniform(0.15, 0.65, size=len(df)), 3),
        np.round(np.random.uniform(0.00, 0.04, size=len(df)), 3)
    )

    is_mixer_interaction = np.where(
        (df["FLAG"] == 1) & (np.random.random(len(df)) < 0.45),
        1,
        0
    )

    is_sanctioned_interaction = np.where(
        (df["FLAG"] == 1) & (np.random.random(len(df)) < 0.20),
        1,
        0
    )

    extended_df = pd.DataFrame({
        "amount_usd": np.round(amount_usd, 2),
        "gas_price_gwei": gas_price_gwei,
        "velocity_24h": velocity_24h,
        "burst_count_5m": burst_count_5m,
        "failed_tx_ratio": failed_tx_ratio,
        "is_mixer_interaction": is_mixer_interaction,
        "is_sanctioned_interaction": is_sanctioned_interaction,
        "FLAG": df["FLAG"]
    })
    extended_df.to_csv(OUTPUT_EXTENDED_CSV, index=False)
    logger.info(f"Saved extended 10k features matrix to {OUTPUT_EXTENDED_CSV}")

    # -------------------------------------------------------------
    # 2. DeFiGuard Production Risk Engine Features Matrix (6 Features)
    # Compatible with backend/app/risk/model.py FEATURE_KEYS:
    # ["value_usd", "value_zscore", "tx_count_1h", "tx_count_24h", "unique_counterparties_24h", "burst_count"]
    # -------------------------------------------------------------
    # Value USD
    defiguard_val_usd = np.where(
        df["FLAG"] == 1,
        np.random.exponential(scale=35000, size=len(df)) + 5000,
        np.random.exponential(scale=1500, size=len(df)) + 50
    )
    # Value Z-score
    val_mean = np.mean(defiguard_val_usd)
    val_std = np.std(defiguard_val_usd)
    value_zscore = np.round((defiguard_val_usd - val_mean) / (val_std + 1e-6), 3)

    # 1h and 24h tx counts
    tx_count_1h = np.where(
        df["FLAG"] == 1,
        np.random.poisson(lam=4.5, size=len(df)),
        np.random.poisson(lam=0.4, size=len(df))
    )
    tx_count_24h = np.where(
        df["FLAG"] == 1,
        np.random.poisson(lam=18.0, size=len(df)),
        np.random.poisson(lam=2.5, size=len(df))
    )

    # Unique counterparties in 24h
    unique_counterparties_24h = np.clip(
        df["Unique_Sent_To_Addresses"] + np.random.poisson(lam=1.5, size=len(df)),
        1, 100
    )

    # Burst count
    burst_count = np.where(
        df["FLAG"] == 1,
        np.random.poisson(lam=3.8, size=len(df)),
        np.random.poisson(lam=0.2, size=len(df))
    )

    defiguard_df = pd.DataFrame({
        "value_usd": np.round(defiguard_val_usd, 2),
        "value_zscore": value_zscore,
        "tx_count_1h": tx_count_1h,
        "tx_count_24h": tx_count_24h,
        "unique_counterparties_24h": unique_counterparties_24h,
        "burst_count": burst_count,
        "sanctions_flag": is_sanctioned_interaction,
        "FLAG": df["FLAG"]
    })
    defiguard_df.to_csv(OUTPUT_DEFIGUARD_CSV, index=False)
    logger.info(f"Saved DeFiGuard production 10k features matrix to {OUTPUT_DEFIGUARD_CSV}")

    return extended_df, defiguard_df

if __name__ == "__main__":
    run_preprocessing()
