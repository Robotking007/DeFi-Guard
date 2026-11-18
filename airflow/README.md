# DeFiGuard Apache Airflow ML Pipeline

This directory contains the Apache Airflow DAGs and infrastructure powering DeFiGuard's machine learning, risk scoring, and continuous regulatory compliance pipelines.

## DAGs Overview

1. **`defiguard_ml_training_dag`** (Schedule: `@daily`)
   - **Task 1: `extract_onchain_transactions`** — Extracts new transactions from Alchemy Sepolia RPC & local warehouse.
   - **Task 2: `engineer_risk_features`** — Computes rolling 7-dimensional risk feature vectors (velocity, burst clusters, mixer hops).
   - **Task 3: `train_isolation_forest`** — Retrains Scikit-learn's unsupervised Isolation Forest anomaly detector.
   - **Task 4: `evaluate_model_drift`** — Benchmarks Wasserstein & Kolmogorov-Smirnov distribution drift against production baseline.
   - **Task 5: `register_model_artifact`** — Promotes approved weights to the Model Registry (`models/*.joblib`).

2. **`defiguard_batch_inference_dag`** (Schedule: `*/15 * * * *` - Every 15 minutes)
   - **Task 1: `poll_unscored_transactions`** — Ingests pending transactions.
   - **Task 2: `execute_model_inference`** — Computes calibrated 0-100 anomaly scores.
   - **Task 3: `screen_sanctions_open_sanctions`** — Cross-references counterparties with the 7.6MB OpenSanctions OFAC index.
   - **Task 4: `flag_high_risk_anomalies`** — Generates alerts for scores $\ge 80.0$.
   - **Task 5: `auto_escalate_compliance_cases`** — Auto-opens formal SAR investigation cases in Module 6.

## Running Apache Airflow

### Option 1: Docker Compose (Recommended)
```bash
docker compose -f airflow/docker-compose.airflow.yml up -d
```
- Airflow Web UI: `http://localhost:8080`
- Default Credentials: `admin` / `admin`

### Option 2: Live UI & API Integration in DeFiGuard
DeFiGuard's backend includes an integrated Airflow Client (`backend/app/services/airflow_service.py`) that connects to Airflow's REST API (`/api/v1/dags`), triggers runs on-demand, and streams live task execution progress directly to the frontend at `http://localhost:3000/risk-center`.
