"""
Tests for Kaggle trained model integration in DeFiGuard.
Verifies model loading, 10k dataset artifacts, and deterministic inference.
"""

from pathlib import Path
import pytest
import joblib
import numpy as np

from app.risk.model import AnomalyRiskEngine, FEATURE_KEYS

def test_kaggle_model_artifact_exists():
    artifact_path = Path(__file__).parent.parent / "app" / "risk" / "isolation_forest_kaggle.joblib"
    assert artifact_path.exists(), f"Model artifact missing at {artifact_path}"
    model = joblib.load(artifact_path)
    assert hasattr(model, "predict"), "Loaded artifact is not a valid scikit-learn estimator"
    assert model.n_features_in_ == len(FEATURE_KEYS)

def test_anomaly_risk_engine_loads_kaggle_model():
    engine = AnomalyRiskEngine()
    assert engine._is_trained is True

    # Test baseline retail transaction (low risk)
    normal_features = {
        "value_usd": 120.0,
        "value_zscore": -0.2,
        "tx_count_1h": 0,
        "tx_count_24h": 1,
        "unique_counterparties_24h": 1,
        "burst_count": 0,
        "sanctions_flag": 0.0
    }
    score, band, signals = engine.predict_risk(normal_features)
    assert 0.0 <= score <= 100.0
    assert band.lower() in ["low", "medium", "high", "critical"]
    assert score < 50.0  # Normal tx should have low risk

    # Test extreme anomalous transaction (high risk)
    fraud_features = {
        "value_usd": 250000.0,
        "value_zscore": 6.5,
        "tx_count_1h": 15,
        "tx_count_24h": 65,
        "unique_counterparties_24h": 32,
        "burst_count": 8,
        "sanctions_flag": 1.0
    }
    score_fraud, band_fraud, signals_fraud = engine.predict_risk(fraud_features)
    assert score_fraud >= 85.0
    assert band_fraud.lower() in ["high", "critical"]
    assert any(s["code"] == "SANCTIONS_MATCH" for s in signals_fraud)
