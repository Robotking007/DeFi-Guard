# DeFiGuard System Architecture Blueprint

## 1. Overview
DeFiGuard is an educational, research-oriented FinTech and Decentralized Finance platform combining:
1. Core DeFi primitives (collateralized lending, token swaps, AMM liquidity pools).
2. Machine-learning anomaly detection and transaction risk scoring.
3. RegTech compliance case management and sanctions screening.
4. Static smart contract vulnerability analysis.
5. Financial risk analytics (LTV, Health Factor, Value at Risk, Stress Testing).
6. DAO governance simulation.

---

## 2. Monorepo Structure

```
defiguard/
├── frontend/             # Next.js 14 + TypeScript + Tailwind CSS
│   ├── app/              # App router pages & layouts
│   ├── components/       # Reusable UI widgets
│   ├── lib/              # API clients & math helpers
│   └── types/            # TypeScript definitions
├── backend/              # Python + FastAPI + SQLAlchemy 2.0
│   ├── app/
│   │   ├── api/v1/       # REST API endpoint routers
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # 12 SQLAlchemy ORM entities
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── services/     # Business logic
│   │   ├── risk/         # ML pipeline & rule heuristics
│   │   ├── compliance/   # Case management & watchlists
│   │   └── security_scanner/ # Contract auditing
│   ├── tests/            # Pytest automated test suites
│   └── alembic/          # Relational database migrations
├── contracts/            # Educational Solidity smart contracts
│   ├── contracts/        # CollateralVault, LendingPool, SimpleAMM
│   ├── scripts/          # Deployment and seeding scripts
│   └── test/             # Hardhat testing suites
├── ml/                   # Machine learning artifacts & notebooks
│   ├── data/             # Synthetic transaction datasets
│   ├── src/              # Feature extractors & model training
│   └── artifacts/        # Serialized models & metrics
└── docs/                 # Architecture, API specifications, Threat model
```

---

## 3. Relational Data Model (12 Core Entities)

| Table | Responsibility | Primary Key |
| :--- | :--- | :--- |
| `users` | User accounts, credentials, RBAC (`user`, `analyst`, `admin`) | UUID |
| `wallets` | Public addresses registered to users (no private keys) | UUID |
| `assets` | Supported tokens (ETH, USDC, WBTC) & contract addresses | UUID |
| `transactions` | Normalized transaction ledger (hash, amount, blocks) | UUID |
| `price_snapshots` | Timestamped asset price feeds with source provenance | UUID |
| `risk_analyses` | Anomaly scores (0–100), risk bands, reason codes | UUID |
| `alerts` | Triggered compliance and high-risk flags | UUID |
| `compliance_cases` | RegTech review queue, investigator notes, dispositions | UUID |
| `contract_scans` | Smart contract static analysis audit sessions | UUID |
| `contract_findings` | Vulnerability notices (reentrancy, access control) | UUID |
| `audit_events` | Immutable log of administrative and review actions | UUID |
| `proposals` & `votes`| DAO governance proposals and token-weighted voting | UUID |

---

## 4. Key Formulas & Business Logic

1. **Loan-to-Value (LTV):**
   $$\text{LTV} = \frac{\text{Borrowed Debt Value (USD)}}{\text{Collateral Value (USD)}} \times 100$$

2. **Health Factor:**
   $$\text{Health Factor} = \frac{\text{Collateral Value (USD)} \times \text{Liquidation Threshold}}{\text{Borrowed Debt Value (USD)}}$$
   * $\text{Health Factor} > 1.0$: Safe position
   * $\text{Health Factor} \le 1.0$: Eligible for liquidation

3. **Constant-Product AMM Invariant:**
   $$x \cdot y = k$$
   $$\text{amountOut} = \frac{\text{amountInWithFee} \cdot \text{reserveOut}}{\text{reserveIn} + \text{amountInWithFee}}$$

4. **Value at Risk (VaR):**
   $$\text{VaR}_{\alpha} = \text{Portfolio Loss Quantile at Confidence } \alpha \text{ over horizon } T$$
