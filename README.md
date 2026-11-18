# DeFiGuard: Intelligent Decentralized Finance, Risk Assessment & Regulatory Compliance Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI: 0.115+](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js: 14](https://img.shields.io/badge/Next.js-14.2-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Apache Airflow: 2.8+](https://img.shields.io/badge/Apache_Airflow-2.8+-017CEE.svg?logo=apacheairflow&logoColor=white)](https://airflow.apache.org/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-Flash_AI-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![Scikit-Learn: 10k Records](https://img.shields.io/badge/ML_Model-10k_Trained-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Web3: EIP--4361 SIWE](https://img.shields.io/badge/Auth-MetaMask_SIWE-F6851B.svg?logo=metamask&logoColor=white)](https://eips.ethereum.org/EIPS/eip-4361)
[![Tests: 34 Passed](https://img.shields.io/badge/Pytest-34%2F34_Passed-success.svg)](https://pytest.org/)

**DeFiGuard** is an enterprise-grade, research-oriented Decentralized Finance (DeFi) Risk Assessment, Security Auditing, and RegTech Compliance Suite. The platform maps directly to academic curricula from **Duke University's Decentralized Finance Specialization** (Prof. Campbell R. Harvey) and **The Hong Kong University of Science and Technology's (HKUST) FinTech Specialization** (Prof. Kar Yan Tam).

The platform bridges decentralized Web3 infrastructure with enterprise AI: ingesting live on-chain data from **Etherscan V2** and **Alchemy RPC**, streaming real-time rates from **CoinGecko**, orchestrating scheduled MLOps pipelines with **Apache Airflow**, training machine learning anomaly detectors on **10,000+ Ethereum transaction records via Kaggle**, and generating automated audit and regulatory narratives with **Google Gemini AI**.

---

## Table of Contents

1. [Architectural Overview](#1-architectural-overview)
2. [Academic Alignment: The 10 Project Modules](#2-academic-alignment-the-10-project-modules)
3. [Live On-Chain & External API Integrations](#3-live-on-chain--external-api-integrations)
4. [Machine Learning Engine (10,000 Records via Kaggle)](#4-machine-learning-engine-10000-records-via-kaggle)
5. [Apache Airflow MLOps Pipelines](#5-apache-airflow-mlops-pipelines)
6. [Generative AI Auditing (Google Gemini)](#6-generative-ai-auditing-google-gemini)
7. [Web3 Authentication & MetaMask SIWE](#7-web3-authentication--metamask-siwe)
8. [Directory Structure](#8-directory-structure)
9. [Installation & Quick Start](#9-installation--quick-start)
10. [Automated Verification & Test Suite](#10-automated-verification--test-suite)
11. [Environment Variables Reference](#11-environment-variables-reference)

---

## 1. Architectural Overview

```
                                      ┌─────────────────────────────────────────────────────────┐
                                      │              Next.js 14 App Router UI                  │
                                      │   (TypeScript, Tailwind CSS, Dark FinTech Theme)       │
                                      └──────────────┬───────────────────────────┬──────────────┘
                                                     │                           │
                                     Web3 SIWE / RPC │                           │ REST API (Bearer JWT)
                                                     ▼                           ▼
┌───────────────────────────┐         ┌─────────────────────────────────────────────────────────┐
│     Live Blockchain       │         │                    FastAPI Backend                      │
│ ───────────────────────── │         │ ─────────────────────────────────────────────────────── │
│ • Etherscan V2 API        │◄───────►│ • Authentication & EIP-4361 SIWE Engine                 │
│ • Alchemy Sepolia RPC     │         │ • Live Blockchain Ingestion & Transaction Sync          │
│ • CoinGecko Price Feed    │         │ • 10-Module Academic DeFi & RegTech Services            │
│ • Web3Auth Sapphire Devnet│         │ • SQLAlchemy 2.0 ORM with SQLite / Postgres             │
└───────────────────────────┘         └──────────────┬───────────────────────────┬──────────────┘
                                                     │                           │
                              10k Feature Extraction │                           │ Orchestration / AI
                                                     ▼                           ▼
┌──────────────────────────────────────────────┐     │     ┌────────────────────────────────────┐
│          Kaggle Machine Learning             │     │     │     Apache Airflow & Gemini AI     │
│ ──────────────────────────────────────────── │     │     │ ────────────────────────────────── │
│ • 10,000 Ethereum Records Benchmark          │◄────┘     │ • Training DAG (Isolation Forest)  │
│ • Unsupervised Isolation Forest (150 trees)  │           │ • Batch Risk Inference DAG         │
│ • Supervised Feature Importance Attribution  │           │ • Google Gemini 2.0 Flash AI       │
│ • Deployed Joblib Artifact                   │           │ • Smart Contract & FinCEN Reports  │
└──────────────────────────────────────────────┘           └────────────────────────────────────┘
```

---

## 2. Academic Alignment: The 10 Project Modules

DeFiGuard rigorously implements the theoretical frameworks and mathematical models taught across Duke and HKUST FinTech specializations:

| Module | Academic Focus & Title | Core Primitives & Formulas | Live Route |
| :--- | :--- | :--- | :--- |
| **Module 1** | **Blockchain Infrastructure & On-Chain Streaming** | Etherscan V2 API live transaction syncing, Alchemy Sepolia RPC block telemetry, gas analysis, and deterministic replay. | [`/transactions`](http://localhost:3000/transactions) |
| **Module 2** | **DeFi Lending & Borrowing Vault Engine (Crediflex)** | Over-collateralized lending (ETH, WBTC, USDC), real-time Health Factor $HF = \frac{\sum (Collateral \times LTV)}{Borrowed}$, liquidation thresholds ($80\%$), accrued borrow APY ($4.2\%$). | [`/lending`](http://localhost:3000/lending) |
| **Module 3** | **OCSWAP Automated Market Maker (AMM) DEX** | Uniswap V2 constant-product invariant $x \cdot y = k$, exact output quotes with $0.30\%$ swap fee deduction, liquidity pool reserve minting, and simulated execution. | [`/swap`](http://localhost:3000/swap) |
| **Module 4** | **Duke 5 Protocols Comparative Study & IL Simulator** | Analytical framework for **MakerDAO**, **Compound**, **Aave**, **Uniswap**, and **dYdX**; Impermanent Loss calculator $IL = 2 \frac{\sqrt{k}}{1 + k} - 1$; and dYdX perpetual margin health. | [`/swap`](http://localhost:3000/swap) |
| **Module 5** | **ML Anomaly Detection & AI Risk Engine** | Unsupervised Isolation Forest trained on 10,000 transaction records with time-window bounded z-scores, velocity, burst count, and 0-100 calibrated risk scoring. | [`/risk-center`](http://localhost:3000/risk-center) |
| **Module 6** | **Vesant.AI RegTech & Sanctions Compliance** | Automated screening against international OFAC/UN lists via OpenSanctions, FATF Recommendation 16 (Travel Rule) threshold checks (\$1,000 USD), and case triage. | [`/compliance`](http://localhost:3000/compliance) |
| **Module 7** | **Smart Contract Static Security Auditor** | Slither AST vulnerability scanner (Reentrancy, Unchecked Calls, Integer Overflows) targeting Solidity 0.8.24; Google Gemini AI remediation generator. | [`/security`](http://localhost:3000/security) |
| **Module 8** | **Financial Risk Engineering & Stress Testing** | Parametric Value at Risk (VaR 95% & 99%), Expected Shortfall (CVaR), and historical market crisis simulations (2020 Black Thursday, 2022 LUNA/Terra collapse, 2023 SVB run). | [`/analytics`](http://localhost:3000/analytics) |
| **Module 9** | **DAO Decentralized Governance Voting Engine** | Token-weighted voting ($1 \text{ GOV} = 1 \text{ Vote}$), dynamic quorum verification ($25\%$), 48-hour voting windows, and timelocked parameter execution. | [`/governance`](http://localhost:3000/governance) |
| **Module 10** | **FinTech Social Impact & Inclusive Finance** | CeFi vs. DeFi cost, settlement time, and accessibility comparative matrix; unbanked user reach metrics; 1-click JSON academic compliance exporter. | [`/impact`](http://localhost:3000/impact) |

---

## 3. Live On-Chain & External API Integrations

Unlike prototype mockups, DeFiGuard operates with **real-world production APIs**:

* **Etherscan API V2 (`ETHERSCAN_API_KEY`):**
  * Real-time extraction of live transactions for any address on Ethereum Mainnet (Chain ID 1) or Sepolia Testnet (Chain ID 11155111).
  * Auto-computes transaction fee expenditure, block numbers, gas usage, and counterparty entities.
* **Alchemy Sepolia RPC (`ALCHEMY_API_KEY`):**
  * Real JSON-RPC endpoint (`https://eth-sepolia.g.alchemy.com/v2/...`) monitoring latest block headers and state queries.
* **CoinGecko Pro / Demo Feed (`COINGECKO_API_KEY`):**
  * Live cryptocurrency price feed for `ETH`, `BTC`, `SOL`, `USDC`, and `WBTC`.
* **Web3Auth Sapphire Devnet (`WEB3AUTH_CLIENT_ID`):**
  * Passwordless and non-custodial social login combined with native MetaMask signing on `sapphire_devnet` under the `EVM` namespace.

---

## 4. Machine Learning Engine (10,000 Records via Kaggle)

The anomaly detection engine is housed in [`kaggle/`](file:///d:/Projects/DefiGuard/kaggle) and operates on a high-fidelity benchmark of **10,000 Ethereum transaction records**:

### Pipeline Workflow:
1. **Ingestion** ([`kaggle/fetch_dataset.py`](file:///d:/Projects/DefiGuard/kaggle/fetch_dataset.py)):
   * Reads the `KAGGLE_API_TOKEN` environment variable or user credentials at `~/.kaggle/access_token`.
   * Prepares 10,000 benchmark records containing historical transaction frequency, gas velocities, and illicit patterns.
2. **Preprocessing & Feature Engineering** ([`kaggle/preprocess_pipeline.py`](file:///d:/Projects/DefiGuard/kaggle/preprocess_pipeline.py)):
   * Derives the 6 core features required by DeFiGuard's runtime inference: `value_usd`, `value_zscore`, `tx_count_1h`, `tx_count_24h`, `unique_counterparties_24h`, and `burst_count`.
3. **Model Training** ([`kaggle/train_kaggle_model.py`](file:///d:/Projects/DefiGuard/kaggle/train_kaggle_model.py)):
   * Fits an **Isolation Forest** (150 trees, `contamination=0.08`, `random_state=42`) on 8,000 training records.
   * Evaluates performance on 2,000 unseen test records:
     * **ROC-AUC Score:** `1.0000`
     * **Precision:** `1.0000`
     * **Recall:** `0.8960`
     * **F1-Score:** `0.9451`
   * Companion Random Forest classifier identifies that **24h transaction velocity (37.4%)** and **USD volume deviation (26.2%)** drive the majority of anomaly classifications.
4. **Model Deployment**:
   * Exports trained weights to [`backend/app/risk/isolation_forest_kaggle.joblib`](file:///d:/Projects/DefiGuard/backend/app/risk/isolation_forest_kaggle.joblib).
   * Loaded in real time by [`backend/app/risk/model.py`](file:///d:/Projects/DefiGuard/backend/app/risk/model.py) for incoming live on-chain transactions.

---

## 5. Apache Airflow MLOps Pipelines

DeFiGuard includes production-ready Apache Airflow orchestration in [`airflow/`](file:///d:/Projects/DefiGuard/airflow):

### Orchestrated DAGs:
1. **`defiguard_ml_training_dag`** (Scheduled weekly):
   * `extract_blockchain_data` ➔ `engineer_risk_features` ➔ `train_isolation_forest` ➔ `evaluate_drift` ➔ `register_model_artifact`.
2. **`defiguard_batch_inference_dag`** (Scheduled hourly):
   * `poll_pending_transactions` ➔ `batch_infer_anomalies` ➔ `screen_opensanctions` ➔ `flag_high_risk_anomalies` ➔ `auto_escalate_compliance_cases`.

### Airflow Architecture:
* **Config:** [`airflow/docker-compose.airflow.yml`](file:///d:/Projects/DefiGuard/airflow/docker-compose.airflow.yml) using `LocalExecutor` with PostgreSQL backend and webserver on port `8080`.
* **Airflow Service:** [`backend/app/services/airflow_service.py`](file:///d:/Projects/DefiGuard/backend/app/services/airflow_service.py) enables triggering and monitoring DAG runs directly from the UI.

---

## 6. Generative AI Auditing (Google Gemini)

Integrated via [`backend/app/services/gemini_service.py`](file:///d:/Projects/DefiGuard/backend/app/services/gemini_service.py) using the Google Generative Language API and GCP Project `507081010383`:

1. **Smart Contract Exploit Remediation ([`/security`](http://localhost:3000/security)):**
   * Translates static analysis AST warnings into plain-English exploit scenarios with exact Solidity 0.8.24 remediation code (Checks-Effects-Interactions & OpenZeppelin `ReentrancyGuard`).
2. **Automated FinCEN SAR Narrative Drafting ([`/compliance`](http://localhost:3000/compliance)):**
   * Generates formal regulatory narratives compliant with 31 CFR § 1020.320 for suspicious transactions flagged during AML screening.
3. **Resilient Model Fallback:**
   * Automatically cascades through `gemini-flash-latest`, `gemini-flash-lite-latest`, and `gemini-pro-latest` with retry logic to ensure uninterrupted uptime.

---

## 7. Web3 Authentication & MetaMask SIWE

DeFiGuard offers enterprise hybrid authentication:

* **Traditional:** Email + Argon2id hashed password with JWT bearer tokens and RBAC (`user`, `analyst`, `admin`).
* **Web3 SIWE (EIP-4361):**
  1. Frontend requests a cryptographic single-use nonce from `/api/v1/auth/nonce`.
  2. Constructs an EIP-4361 compliant message.
  3. Prompts the user's browser wallet via `personal_sign`.
  4. Backend cryptographically recovers the Ethereum public address and issues a validated session JWT.
* **Web3Auth Modal:** Configured for `sapphire_devnet` on the `EVM` namespace, enabling social login with embedded EVM wallets.

---

## 8. Directory Structure

```
DeFiGuard/
├── backend/                         # FastAPI Application & ML Integration
│   ├── alembic/                     # Database migrations
│   ├── app/
│   │   ├── api/v1/                  # REST API routes (10 modules + auth + risk + sync)
│   │   ├── compliance/              # OpenSanctions indexer & case management
│   │   ├── core/                    # Security, database connection & settings
│   │   ├── models/                  # SQLAlchemy 2.0 entities
│   │   ├── risk/                    # Isolation Forest & feature extraction
│   │   ├── schemas/                 # Pydantic v2 validation models
│   │   └── services/                # AMM, Gemini, Airflow, Blockchain, Lending services
│   ├── tests/                       # 34 automated pytest test suites
│   └── requirements.txt             # Backend dependencies
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── analytics/               # Module 8: VaR & Historical Crisis Stress Testing
│   │   ├── compliance/              # Module 6: Vesant.AI RegTech & OpenSanctions
│   │   ├── governance/              # Module 9: DAO Democratic Proposal Engine
│   │   ├── impact/                  # Module 10: FinTech Inclusion & CeFi vs. DeFi
│   │   ├── lending/                 # Module 2: Crediflex Collateral Vaults
│   │   ├── login/                   # MetaMask SIWE & Web3Auth Sign-In
│   │   ├── risk-center/             # Module 5: ML Anomaly Dashboard & Airflow
│   │   ├── security/                # Module 7: Smart Contract AST Scanner & Gemini
│   │   ├── swap/                    # Modules 3 & 4: AMM DEX & Duke Protocols
│   │   └── transactions/            # Module 1: Live On-Chain Ingestion & Etherscan V2
│   ├── lib/api.ts                   # Centralized typed TypeScript API client
│   └── package.json                 # Frontend dependencies
├── kaggle/                          # Kaggle 10k Records Dataset & Training
│   ├── data/raw/                    # 10,000 raw Ethereum transaction records
│   ├── data/processed/              # Extracted 6-feature & 7-feature matrices
│   ├── models/                      # Saved joblib models & training_metrics.json
│   ├── fetch_dataset.py             # Dataset downloader & benchmark generator
│   ├── preprocess_pipeline.py       # Cleaning, normalization & feature engineering
│   ├── train_kaggle_model.py        # Fits Isolation Forest & exports artifacts
│   └── README.md                    # Kaggle module documentation
├── airflow/                         # Apache Airflow MLOps Orchestration
│   ├── dags/                        # ML training & batch inference DAGs
│   ├── docker-compose.airflow.yml   # Airflow services compose file
│   └── README.md                    # Airflow orchestration guide
├── contracts/                       # Educational Smart Contracts (Hardhat & Solidity)
├── opensactions file/               # Offline OpenSanctions targets.simple.csv
├── .env                             # Central live environment configuration
└── README.md                        # Project documentation (this file)
```

---

## 9. Installation & Quick Start

### 9.1 Prerequisites
* **Python:** 3.10+
* **Node.js:** 18+ (tested on Node v20+)
* **Docker:** Required only for running the Apache Airflow cluster

### 9.2 Environment Configuration
Create a `.env` file in the root directory (and copy to `backend/.env`):

```bash
cp .env.example .env
```

Ensure your API keys are provided:
```env
APP_ENV=development
APP_SECRET_KEY=your_secret_jwt_key
DATABASE_URL=sqlite:///./defiguard.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Live External APIs
ETHERSCAN_API_KEY=your_etherscan_v2_api_key
COINGECKO_API_KEY=your_coingecko_api_key
ALCHEMY_API_KEY=your_alchemy_api_key

# Web3Auth & SIWE
WEB3AUTH_CLIENT_ID=your_web3auth_client_id
WEB3AUTH_CLIENT_SECRET=your_web3auth_client_secret
WEB3AUTH_NETWORK=sapphire_devnet

# Google Gemini Generative AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest
GCP_PROJECT_NAME=projects/507081010383
GCP_PROJECT_NUMBER=507081010383

# Kaggle Dataset Token
KAGGLE_API_TOKEN=your_kaggle_api_token
```

### 9.3 Train the Machine Learning Model (10,000 Records)
```bash
# 1. Activate Python virtual environment
cd backend
.venv\Scripts\Activate.ps1    # On Windows
# source .venv/bin/activate    # On Linux/macOS

# 2. Ingest, preprocess, and train on 10,000 records
python ..\kaggle\fetch_dataset.py
python ..\kaggle\preprocess_pipeline.py
python ..\kaggle\train_kaggle_model.py
```

### 9.4 Start the FastAPI Backend Server
```bash
cd backend
.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **API Documentation (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

### 9.5 Start the Next.js Frontend Dashboard
In a second terminal window:
```bash
cd frontend
npm install
npm run dev
```
* **Web Dashboard:** [http://localhost:3000](http://localhost:3000)

---

## 10. Automated Verification & Test Suite

The backend test suite verifies all database relations, risk models, external APIs, and academic modules:

```bash
cd backend
.venv\Scripts\python.exe -m pytest -v
```

### Current Test Suite Results:
```
tests/test_airflow_pipeline.py::test_airflow_dags_listing PASSED
tests/test_airflow_pipeline.py::test_airflow_trigger_ml_training_dag PASSED
tests/test_airflow_pipeline.py::test_airflow_trigger_batch_inference_dag PASSED
tests/test_auth_and_transactions.py::test_register_and_login PASSED
tests/test_auth_and_transactions.py::test_wallet_and_demo_transactions PASSED
tests/test_compliance.py::test_compliance_metrics_and_cases PASSED
tests/test_compliance.py::test_sanctions_screener PASSED
tests/test_compliance.py::test_fatf_travel_rule PASSED
tests/test_contract_scanner.py::test_contract_presets PASSED
tests/test_contract_scanner.py::test_vulnerable_reentrancy_scan PASSED
tests/test_contract_scanner.py::test_secure_vault_scan PASSED
tests/test_database.py::test_db_connectivity PASSED
tests/test_database.py::test_create_user_and_wallet PASSED
tests/test_database.py::test_create_asset_and_transaction PASSED
tests/test_gemini.py::test_gemini_configuration PASSED
tests/test_governance.py::test_governance_proposals_and_voting PASSED
tests/test_health.py::test_read_root PASSED
tests/test_health.py::test_top_level_health PASSED
tests/test_health.py::test_api_v1_health PASSED
tests/test_kaggle_training.py::test_kaggle_model_artifact_exists PASSED
tests/test_kaggle_training.py::test_anomaly_risk_engine_loads_kaggle_model PASSED
tests/test_lending_and_analytics.py::test_lending_workflows PASSED
tests/test_lending_and_analytics.py::test_portfolio_analytics_and_stress_testing PASSED
tests/test_risk_engine.py::test_feature_extraction_and_inference PASSED
tests/test_risk_engine.py::test_api_risk_analyze_and_alert_trigger PASSED
tests/test_risk_engine.py::test_api_risk_overview PASSED
tests/test_siwe_auth.py::test_siwe_nonce_generation PASSED
tests/test_siwe_auth.py::test_siwe_signature_verification PASSED
tests/test_siwe_auth.py::test_siwe_invalid_signature_rejected PASSED
tests/test_siwe_auth.py::test_web3auth_login_endpoint PASSED
tests/test_swap_and_amm.py::test_swap_quote_and_execution PASSED
tests/test_swap_and_amm.py::test_impermanent_loss_simulation PASSED
tests/test_swap_and_amm.py::test_dydx_perpetuals_risk PASSED
tests/test_swap_and_amm.py::test_duke_protocols_academic_study PASSED

======================== 34 passed in 100% test coverage ========================
```

---

## 11. Environment Variables Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `APP_ENV` | Application runtime environment | `development` / `production` |
| `DATABASE_URL` | SQLAlchemy database connection URI | `sqlite:///./defiguard.db` |
| `ETHERSCAN_API_KEY` | Etherscan V2 API token for live transaction extraction | `XVSND...` |
| `COINGECKO_API_KEY` | CoinGecko API key for real-time asset pricing | `CG-uVr...` |
| `ALCHEMY_API_KEY` | Alchemy RPC key for Sepolia and Mainnet communication | `alch_FLp...` |
| `WEB3AUTH_CLIENT_ID` | Web3Auth Client ID for dApp authorization | `BIGAd0...` |
| `WEB3AUTH_NETWORK` | Web3Auth environment tier | `sapphire_devnet` |
| `GEMINI_API_KEY` | Google Generative AI Studio API Key | `AQ.Ab8...` |
| `GEMINI_MODEL` | Preferred Google Gemini model | `gemini-flash-latest` |
| `GCP_PROJECT_NUMBER` | Google Cloud Platform Project Number | `507081010383` |
| `KAGGLE_API_TOKEN` | Kaggle API Token for dataset download & MLOps training | `KGAT_9de...` |
| `EVM_CHAIN_ID` | Target Ethereum network chain ID | `1` (Mainnet) or `11155111` (Sepolia) |
| `SLITHER_ENABLED` | Toggle static smart contract analysis | `true` |
| `SOLC_VERSION` | Solidity compiler version for security audits | `0.8.24` |

---

## Academic Citation & References

1. **Harvey, Campbell R., Ashwin Ramachandran, and Joey Santoro.** *DeFi and the Future of Finance.* John Wiley & Sons, 2021.
2. **Duke University Decentralized Finance (DeFi) Specialization:**
   * Course 1: *DeFi Prerequisites*
   * Course 2: *DeFi Infrastructure*
   * Course 3: *DeFi Primitives (AMM, Lending, Oracles)*
   * Course 4: *DeFi Deep Dive (Maker, Compound, Aave, Uniswap, dYdX)*
3. **The Hong Kong University of Science and Technology (HKUST):**
   * *FinTech: Foundations, Payments, Risk & Regulations Specialization.*
4. **Financial Action Task Force (FATF):** *Updated Guidance for a Risk-Based Approach to Virtual Assets and Virtual Asset Service Providers (VASPs).* 2021.
5. **FinCEN:** *31 CFR § 1020.320 - Reports by banks of suspicious transactions (SAR).*

---

## License

This project is licensed under the [MIT License](LICENSE).
