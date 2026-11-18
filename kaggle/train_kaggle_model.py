"""
DeFiGuard Kaggle Model Training Engine
Trains unsupervised IsolationForest and supervised Random Forest models on 10,000+ transaction records.
Exports deployable model artifacts to backend/app/risk/isolation_forest_kaggle.joblib
and kaggle/models/.
"""

import os
import sys
import json
import logging
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("kaggle_train")

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data" / "processed"
DEFIGUARD_DATA_PATH = DATA_DIR / "defiguard_risk_features_10k.csv"
EXTENDED_DATA_PATH = DATA_DIR / "train_features_10k.csv"

MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

BACKEND_RISK_DIR = BASE_DIR.parent / "backend" / "app" / "risk"
BACKEND_RISK_DIR.mkdir(parents=True, exist_ok=True)

DEFIGUARD_FEATURE_KEYS = [
    "value_usd",
    "value_zscore",
    "tx_count_1h",
    "tx_count_24h",
    "unique_counterparties_24h",
    "burst_count"
]

def train_models():
    # 1. Ensure preprocessed data exists
    if not DEFIGUARD_DATA_PATH.exists():
        logger.info(f"Dataset not found at {DEFIGUARD_DATA_PATH}. Running preprocessing...")
        from preprocess_pipeline import run_preprocessing
        run_preprocessing()

    logger.info(f"Loading DeFiGuard 10k dataset from {DEFIGUARD_DATA_PATH}...")
    df = pd.read_csv(DEFIGUARD_DATA_PATH)
    logger.info(f"Successfully loaded {len(df):,} records for training.")

    X = df[DEFIGUARD_FEATURE_KEYS].values
    y = df["FLAG"].values

    # Train / Test Split (80% train / 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    logger.info(f"Split completed: {len(X_train):,} training records, {len(X_test):,} test evaluation records.")

    # 2. Train DeFiGuard Production Isolation Forest (150 trees)
    logger.info("Training DeFiGuard IsolationForest on 10,000 transaction dataset...")
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=0.08,
        max_samples="auto",
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train)

    # Evaluate on test set
    raw_scores = iso_forest.score_samples(X_test)
    preds = iso_forest.predict(X_test)
    binary_preds = np.where(preds == -1, 1, 0)

    iso_auc = roc_auc_score(y_test, -raw_scores)
    iso_prec = precision_score(y_test, binary_preds, zero_division=0)
    iso_rec = recall_score(y_test, binary_preds, zero_division=0)
    iso_f1 = f1_score(y_test, binary_preds, zero_division=0)

    logger.info(f"Isolation Forest Test Results:")
    logger.info(f"  -> ROC-AUC:    {iso_auc:.4f}")
    logger.info(f"  -> Precision:  {iso_prec:.4f}")
    logger.info(f"  -> Recall:     {iso_rec:.4f}")
    logger.info(f"  -> F1-Score:   {iso_f1:.4f}")

    # 3. Train Supervised Random Forest Classifier for Feature Attribution
    logger.info("Training Supervised Classifier for feature importance attribution...")
    rf_clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        random_state=42,
        class_weight="balanced"
    )
    rf_clf.fit(X_train, y_train)

    rf_preds = rf_clf.predict(X_test)
    rf_probs = rf_clf.predict_proba(X_test)[:, 1]
    rf_auc = roc_auc_score(y_test, rf_probs)
    rf_f1 = f1_score(y_test, rf_preds)

    importances = dict(zip(DEFIGUARD_FEATURE_KEYS, [round(float(v), 4) for v in rf_clf.feature_importances_]))
    logger.info(f"Supervised RF Classifier ROC-AUC: {rf_auc:.4f} | F1: {rf_f1:.4f}")
    logger.info(f"Feature Importances: {importances}")

    # 4. Save and Deploy Model Artifacts
    backend_model_path = BACKEND_RISK_DIR / "isolation_forest_kaggle.joblib"
    kaggle_model_path = MODELS_DIR / "isolation_forest_10k.joblib"
    kaggle_rf_path = MODELS_DIR / "random_forest_classifier_10k.joblib"

    joblib.dump(iso_forest, backend_model_path)
    joblib.dump(iso_forest, kaggle_model_path)
    joblib.dump(rf_clf, kaggle_rf_path)
    logger.info(f"Saved model artifact to: {backend_model_path}")
    logger.info(f"Saved model artifact to: {kaggle_model_path}")

    # 5. Save Training Metadata
    metrics = {
        "model_name": "DeFiGuard Kaggle Isolation Forest",
        "dataset_records_total": len(df),
        "dataset_records_train": len(X_train),
        "dataset_records_test": len(X_test),
        "features": DEFIGUARD_FEATURE_KEYS,
        "isolation_forest_metrics": {
            "n_estimators": 150,
            "contamination": 0.08,
            "roc_auc": round(float(iso_auc), 4),
            "precision": round(float(iso_prec), 4),
            "recall": round(float(iso_rec), 4),
            "f1_score": round(float(iso_f1), 4)
        },
        "supervised_rf_metrics": {
            "n_estimators": 100,
            "roc_auc": round(float(rf_auc), 4),
            "f1_score": round(float(rf_f1), 4),
            "feature_importances": importances
        },
        "model_artifact_path": str(backend_model_path)
    }

    metrics_file = MODELS_DIR / "training_metrics.json"
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    logger.info(f"Saved training metrics to {metrics_file}")

    print("\n" + "="*60)
    print(">>> DEFIGUARD ML MODEL TRAINED ON 10,000 DATA RECORDS <<<")
    print("="*60)
    print(f"Total Dataset Records:    {len(df):,}")
    print(f"Training Sample Count:    {len(X_train):,}")
    print(f"Test Evaluation Count:    {len(X_test):,}")
    print(f"Isolation Forest ROC-AUC: {iso_auc:.4f}")
    print(f"Supervised RF ROC-AUC:    {rf_auc:.4f}")
    print(f"Saved Backend Artifact:   {backend_model_path}")
    print("="*60 + "\n")
    return metrics

if __name__ == "__main__":
    train_models()
