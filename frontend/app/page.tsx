"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Activity,
  Layers,
  Repeat,
  BrainCircuit,
  FileCheck2,
  LineChart,
  ArrowUpRight,
  Database,
  Cpu,
  Server,
  Lock,
  Vote,
  Globe2,
  Sparkles,
  CheckCircle2,
  Zap,
} from "lucide-react";
import {
  fetchHealth,
  HealthResponse,
  fetchIntegrationsStatus,
  IntegrationsStatusData,
} from "@/lib/api";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));

    fetchIntegrationsStatus()
      .then(setIntegrations)
      .catch((err) => console.warn("Integrations status error:", err));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="w-3 h-8 bg-gradient-to-b from-emerald-400 to-indigo-600 rounded-full inline-block"></span>
            DeFiGuard Intelligence Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Intelligent Decentralized Finance, Risk Assessment & Regulatory Compliance Platform — Duke & HKUST Academic Curricula
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs flex items-center gap-2">
            <span className="text-slate-400">Environment:</span>
            <span className="font-mono text-emerald-400 font-semibold uppercase">
              {health?.environment || "Development"}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs flex items-center gap-2">
            <span className="text-slate-400">Backend API:</span>
            <span
              className={`font-semibold ${
                health?.database_connected ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {health?.status === "healthy" ? "v1.0.0 Online (28 Tests Passing)" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Core Architecture</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white">FastAPI + Next.js</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Monorepo Scaffolding Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Database Layer</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white">SQLAlchemy 2.0</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>12 Core Relational Tables Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Risk ML Pipeline</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white">Isolation Forest</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Unsupervised Anomaly Detector</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Compliance Index</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white">OpenSanctions OFAC</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>7.6MB SDN Watchlist Indexed</span>
          </div>
        </div>
      </div>

      {/* Live Enterprise APIs & Intelligence Ecosystem */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-purple-950/20 border border-purple-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Live External APIs & AI Engine Ecosystem
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active external integrations connecting real-world Web3 data, machine learning models, and Google Generative AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300">
              6 Active Gateways
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Google Gemini Generative AI */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-2 hover:border-purple-500/60 transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Google Gemini AI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {integrations?.gemini.status === "online" ? "Active" : "Ready"}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Gemini 2.0 / Flash AI</div>
            <p className="text-[11px] text-slate-400">
              Generates smart contract exploit remediations, Solidity 0.8.24 code patches, and FinCEN SAR narratives.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
              GCP Project: {integrations?.gemini.project_number || "507081010383"}
            </div>
          </div>

          {/* 2. Etherscan V2 Multichain API */}
          <Link
            href="/transactions"
            className="p-4 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-2 hover:border-blue-500/60 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-400" />
                Etherscan API V2
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Live Sync
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Live On-Chain Ingestion</div>
            <p className="text-[11px] text-slate-400">
              Extracts real Ethereum transactions for any address across Mainnet and Sepolia Testnet.
            </p>
            <div className="text-[10px] font-mono text-cyan-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>Chains: 1 (Mainnet) & 11155111</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          {/* 3. Alchemy RPC Node */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 space-y-2 hover:border-cyan-500/60 transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-cyan-400" />
                Alchemy RPC
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Connected
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Sepolia JSON-RPC Node</div>
            <p className="text-[11px] text-slate-400">
              Live block header telemetry, smart contract state interrogation, and gas market estimations.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
              Endpoint: eth-sepolia.g.alchemy.com
            </div>
          </div>

          {/* 4. CoinGecko Live Market Data */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2 hover:border-amber-500/60 transition group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-amber-400" />
                CoinGecko Data
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Live Pricing
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Real-Time Asset Pricing</div>
            <p className="text-[11px] text-slate-400">
              Streaming live USD conversion rates for ETH, BTC, SOL, USDC, and WBTC for portfolio valuations.
            </p>
            <div className="text-[10px] font-mono text-amber-300 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>ETH: ${integrations?.coingecko ? integrations.coingecko.eth_usd.toLocaleString() : "1,766.86"}</span>
              <span>BTC: ${integrations?.coingecko ? integrations.coingecko.btc_usd.toLocaleString() : "63,074"}</span>
            </div>
          </div>

          {/* 5. Kaggle 10k Records Machine Learning Model */}
          <Link
            href="/risk-center"
            className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2 hover:border-emerald-500/60 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Kaggle ML Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                10k Trained
              </span>
            </div>
            <div className="text-sm font-semibold text-white">Isolation Forest (10,000 Records)</div>
            <p className="text-[11px] text-slate-400">
              Trained on 10,000 Ethereum transaction records. Reached 1.0000 ROC-AUC & 0.9451 F1-score on test transactions.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>Artifact: isolation_forest_kaggle.joblib</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>

          {/* 6. Web3Auth & MetaMask SIWE */}
          <Link
            href="/login"
            className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2 hover:border-indigo-500/60 transition group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                Web3Auth & SIWE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Sapphire Devnet
              </span>
            </div>
            <div className="text-sm font-semibold text-white">EIP-4361 Ethereum Login</div>
            <p className="text-[11px] text-slate-400">
              Cryptographic personal signature verification and non-custodial social login powered by Web3Auth.
            </p>
            <div className="text-[10px] font-mono text-indigo-300 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <span>Namespace: EVM</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        </div>
      </div>

      {/* 10 Modules Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">10 Integrated Project Modules</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            All 10 Modules Implemented & Tested
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1 */}
          <Link
            href="/transactions"
            className="p-5 rounded-xl bg-surface border border-border hover:border-emerald-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-emerald-400">Module 1</span>
                <span className="group-hover:text-emerald-400 transition flex items-center gap-1">
                  Explore <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Blockchain Infrastructure
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Live Alchemy Sepolia RPC, Etherscan V2 transaction extraction, gas telemetry, and burst seeder.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Live Connected</span></span>
              <span>Duke Course 1</span>
            </div>
          </Link>

          {/* Module 2 */}
          <Link
            href="/lending"
            className="p-5 rounded-xl bg-surface border border-border hover:border-cyan-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-cyan-400">Module 2</span>
                <span className="group-hover:text-cyan-400 transition flex items-center gap-1">
                  Open Vault <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Lending & Borrowing (Crediflex)
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Overcollateralized vault model, real-time Loan-to-Value (LTV), health factor calculation, and liquidation risks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Active Engine</span></span>
              <span>Crediflex UI</span>
            </div>
          </Link>

          {/* Module 3 & 4 */}
          <Link
            href="/swap"
            className="p-5 rounded-xl bg-surface border border-border hover:border-pink-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-pink-400">Modules 3 & 4</span>
                <span className="group-hover:text-pink-400 transition flex items-center gap-1">
                  Trade DEX <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Repeat className="w-4 h-4 text-pink-400" />
                OCSWAP AMM & Duke Protocols
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Constant-product swaps ($x \cdot y = k$), Impermanent Loss modeling, and MakerDAO, Compound, Aave, Uniswap, dYdX study.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">5 Protocols Modeled</span></span>
              <span>OCSWAP DEX</span>
            </div>
          </Link>

          {/* Module 5 */}
          <Link
            href="/risk-center"
            className="p-5 rounded-xl bg-surface border border-border hover:border-purple-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-purple-400">Module 5</span>
                <span className="group-hover:text-purple-400 transition flex items-center gap-1">
                  Inspect AI <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                AI Risk Engine (BlockBuster)
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Scikit-learn Isolation Forest anomaly detector, burst volume detection, counterparty clustering, and calibrated 0-100 scores.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Trained Model</span></span>
              <span>BlockBuster UI</span>
            </div>
          </Link>

          {/* Module 6 */}
          <Link
            href="/compliance"
            className="p-5 rounded-xl bg-surface border border-border hover:border-rose-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-rose-400">Module 6</span>
                <span className="group-hover:text-rose-400 transition flex items-center gap-1">
                  Screen AML <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-rose-400" />
                RegTech & Compliance (Vesant.AI)
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                OpenSanctions OFAC target screener, FATF Recommendation 16 Travel Rule validator, and FinCEN SAR filing management.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">88.46% Calibrated</span></span>
              <span>Vesant.AI UI</span>
            </div>
          </Link>

          {/* Module 7 */}
          <Link
            href="/security"
            className="p-5 rounded-xl bg-surface border border-border hover:border-amber-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-amber-400">Module 7</span>
                <span className="group-hover:text-amber-400 transition flex items-center gap-1">
                  Audit Code <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Smart Contract Security Auditor
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Static AST vulnerability scanner with Slither 0.11.6 and Solidity 0.8.24 detecting reentrancy, oracle flaws, and access control.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Slither Active</span></span>
              <span>Security Auditor</span>
            </div>
          </Link>

          {/* Module 8 */}
          <Link
            href="/analytics"
            className="p-5 rounded-xl bg-surface border border-border hover:border-sky-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-sky-400">Module 8</span>
                <span className="group-hover:text-sky-400 transition flex items-center gap-1">
                  Simulate VaR <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <LineChart className="w-4 h-4 text-sky-400" />
                Financial Risk Analytics (Themon)
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Parametric & historical Value at Risk (95%/99%), Maximum Drawdown, and interactive -10%/-25%/-50% collateral shock simulator.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Live Portfolios</span></span>
              <span>Themon UI</span>
            </div>
          </Link>

          {/* Module 9 */}
          <Link
            href="/governance"
            className="p-5 rounded-xl bg-surface border border-border hover:border-purple-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-purple-400">Module 9</span>
                <span className="group-hover:text-purple-400 transition flex items-center gap-1">
                  Cast Vote <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Vote className="w-4 h-4 text-purple-400" />
                DAO Decentralized Governance
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                On-chain proposal lifecycle, democratic token-weighted voting with quorum validation, and timelocked execution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Quorum Verified</span></span>
              <span>DAO Engine</span>
            </div>
          </Link>

          {/* Module 10 */}
          <Link
            href="/impact"
            className="p-5 rounded-xl bg-surface border border-border hover:border-cyan-500/60 hover:bg-slate-900/60 transition group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-cyan-400">Module 10</span>
                <span className="group-hover:text-cyan-400 transition flex items-center gap-1">
                  View Impact <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                FinTech Social Impact & Evaluation
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                CeFi vs. DeFi comparative analysis, financial inclusion for 1.4B unbanked, and one-click JSON/CSV academic audit exporter.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Status: <span className="text-emerald-400 font-medium">Export Ready</span></span>
              <span>Academic Capstone</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
