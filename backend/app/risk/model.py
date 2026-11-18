import os
import json
from pathlib import Path
from typing import Dict, Any, List, Tuple
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

MODEL_VERSION = "1.0.0"
MODEL_NAME = "isolation_forest"

FEATURE_KEYS = [
    "value_usd",
    "value_zscore",
    "tx_count_1h",
    "tx_count_24h",
    "unique_counterparties_24h",
    "burst_count",
]


class AnomalyRiskEngine:
    """
    Interpretable AI Risk Engine combining unsupervised Isolation Forest
    with deterministic RegTech compliance rules.
    """

    def __init__(self):
        self.model = IsolationForest(
            n_estimators=100,
            contamination=0.15,
            random_state=42,
        )
        self._is_trained = False
        self._init_baseline()

    def _init_baseline(self):
        """Fit or load model with representative baseline or Kaggle 10k trained artifact."""
        artifact_path = Path(__file__).parent / "isolation_forest_kaggle.joblib"
        if artifact_path.exists():
            try:
                self.model = joblib.load(artifact_path)
                self._is_trained = True
                return
            except Exception:
                pass

        np.random.seed(42)
        n_samples = 500
        val_usd = np.random.exponential(scale=1500, size=n_samples) + 100
        zscore = np.random.normal(loc=0.0, scale=1.0, size=n_samples)
        tx_1h = np.random.poisson(lam=0.5, size=n_samples)
        tx_24h = np.random.poisson(lam=2.5, size=n_samples)
        unique_cp = np.random.poisson(lam=2.0, size=n_samples)
        burst = np.random.poisson(lam=0.2, size=n_samples)

        X_train = np.column_stack([val_usd, zscore, tx_1h, tx_24h, unique_cp, burst])
        self.model.fit(X_train)
        self._is_trained = True

    def predict_risk(self, features: Dict[str, float]) -> Tuple[float, str, List[Dict[str, Any]]]:
        """
        Evaluate extracted features and return:
        (calibrated_score_0_to_100, risk_band, list_of_contributing_signals)
        """
        vector = np.array([[features.get(k, 0.0) for k in FEATURE_KEYS]])
        
        # Raw anomaly score: positive = normal, negative = anomaly
        raw_score = float(self.model.decision_function(vector)[0])
        
        # Transform raw decision score to 0-100 scale:
        # Typical raw scores range from -0.3 (extreme outlier) to +0.25 (typical center)
        # We invert so higher = more risky
        norm_score = max(0.0, min(100.0, (0.20 - raw_score) * 150.0))

        signals = []

        # 1. Sanctions Check Rule (Critical Override)
        if features.get("sanctions_flag", 0.0) > 0.5:
            norm_score = max(norm_score, 94.0)
            signals.append({
                "code": "SANCTIONS_MATCH",
                "label": "Counterparty Watchlist Match",
                "weight": 0.45,
                "description": "Counterparty is designated on international OFAC/sanctions watchlist.",
            })

        # 2. Value Deviation Rule
        if features.get("value_zscore", 0.0) >= 3.0 or features.get("value_usd", 0.0) > 50000:
            norm_score = max(norm_score, 75.0)
            signals.append({
                "code": "VALUE_OUTLIER",
                "label": "Extreme Value Deviation",
                "weight": 0.30,
                "description": f"Transaction volume (${features.get('value_usd', 0):,.2f}) significantly exceeds historical wallet baseline.",
            })

        # 3. Burst Velocity Rule
        if features.get("burst_count", 0.0) >= 3.0:
            norm_score = max(norm_score, 65.0)
            signals.append({
                "code": "TX_BURST",
                "label": "Rapid Transaction Burst",
                "weight": 0.25,
                "description": f"{int(features.get('burst_count', 0))} transactions executed within a 10-minute window.",
            })

        # 4. High Counterparty Velocity
        if features.get("unique_counterparties_24h", 0.0) >= 10.0:
            signals.append({
                "code": "COUNTERPARTY_DISPERSAL",
                "label": "Rapid Counterparty Dispersal",
                "weight": 0.15,
                "description": "Funds dispersed across multiple unlinked recipient addresses.",
            })

        # If normal with no signals triggered
        if not signals:
            signals.append({
                "code": "BASELINE_NORMAL",
                "label": "Consistent with Baseline Profile",
                "weight": 0.05,
                "description": "Transaction characteristics align with standard DeFi user patterns.",
            })

        # Determine risk band
        final_score = round(norm_score, 1)
        if final_score >= 80.0:
            risk_band = "critical"
        elif final_score >= 60.0:
            risk_band = "high"
        elif final_score >= 25.0:
            risk_band = "medium"
        else:
            risk_band = "low"

        return final_score, risk_band, signals


# Global instance
risk_engine = AnomalyRiskEngine()
