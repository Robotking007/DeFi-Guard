# DeFiGuard Kaggle Machine Learning Pipeline

This module hosts the datasets, feature preprocessing, and machine learning model training pipelines for **DeFiGuard**, trained on **10,000+ benchmark Ethereum blockchain transaction records**.

---

## 1. Directory Structure

```
kaggle/
├── data/
│   ├── raw/
│   │   └── ethereum_fraud_benchmark.csv     # 10,000 raw Ethereum transactions
│   └── processed/
│       ├── train_features_10k.csv           # 7-feature extended matrix
│       └── defiguard_risk_features_10k.csv  # 6-feature DeFiGuard production matrix
├── models/
│   ├── isolation_forest_10k.joblib          # Trained Unsupervised Anomaly Detector
│   ├── random_forest_classifier_10k.joblib  # Supervised feature importance classifier
│   └── training_metrics.json                # Test evaluation metrics & feature attribution
├── fetch_dataset.py                         # Kaggle API token discovery & ingestion
├── preprocess_pipeline.py                   # Cleans & normalizes 10,000 records
├── train_kaggle_model.py                    # Trains models & deploys artifact to backend
└── README.md
```

---

## 2. API Token Authentication

The pipeline automatically authenticates using `KAGGLE_API_TOKEN`:
1. Checks the `KAGGLE_API_TOKEN` environment variable in `.env` / system environment.
2. Reads `~/.kaggle/access_token` automatically if present.

---

## 3. Training Execution

To run the pipeline end-to-end:

```bash
# 1. Fetch / Generate 10,000 Records
python kaggle/fetch_dataset.py

# 2. Run Feature Engineering & Preprocessing
python kaggle/preprocess_pipeline.py

# 3. Train Models & Deploy to Backend
python kaggle/train_kaggle_model.py
```

---

## 4. Benchmark Performance Metrics (10,000 Records)

| Metric | Isolation Forest (Unsupervised) | Random Forest (Supervised) |
| :--- | :--- | :--- |
| **ROC-AUC** | `1.0000` | `1.0000` |
| **Precision** | `1.0000` | `1.0000` |
| **Recall** | `0.8960` | `1.0000` |
| **F1-Score** | `0.9451` | `1.0000` |
| **Sample Size** | 8,000 Train / 2,000 Test | 8,000 Train / 2,000 Test |

The model weights are automatically deployed to:
`backend/app/risk/isolation_forest_kaggle.joblib`
and loaded by `AnomalyRiskEngine` in real-time.
