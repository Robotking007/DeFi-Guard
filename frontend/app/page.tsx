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
} from "lucide-react";
import { fetchHealth, HealthResponse } from "@/lib/api";

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            DeFiGuard Intelligence Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Intelligent Decentralized Finance, Risk Assessment & Regulatory Compliance Platform
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
              {health?.status === "healthy" ? "v1.0.0 Online" : "Checking..."}
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
            <span>12 Core Relational Tables Seeded</span>
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
            <span className="text-xs text-slate-400 font-medium">Safety Standard</span>
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-white">Testnet Only</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Zero Real-Money Risk Sandbox</span>
          </div>
        </div>
      </div>

      {/* 10 Modules Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">10 Integrated Project Modules</h2>
          <span className="text-xs text-slate-400">
            Sprint 0 & 1 Scaffolding Complete
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 1</span>
              <span>Duke DeFi Infra</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Blockchain Infrastructure
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              EVM provider, public wallet connection, chain ID resolution, block numbers, and gas telemetry.
            </p>
          </div>

          {/* Module 2 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 2</span>
              <span>Duke DeFi Primitives</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Lending & Borrowing
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Overcollateralized vault model, real-time Loan-to-Value (LTV), health factor calculation, and liquidation risks.
            </p>
          </div>

          {/* Module 3 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 3</span>
              <span>Constant Product AMM</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Repeat className="w-4 h-4 text-indigo-400" />
              Decentralized Exchange
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Constant-product invariant ($x \cdot y = k$), slippage estimates, price impact, and liquidity provider fee tiers.
            </p>
          </div>

          {/* Module 4 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 4</span>
              <span>Hardhat & OpenZeppelin</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              Smart Contract Architecture
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Educational Solidity contracts for CollateralVault, LendingPool, and SimpleAMM with complete unit test coverage.
            </p>
          </div>

          {/* Module 5 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 5</span>
              <span>HKUST FinTech Risk</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              AI Risk Engine
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Isolation Forest anomaly detection, burst volume detection, counterparty clustering, and transparent reason codes.
            </p>
          </div>

          {/* Module 6 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 6</span>
              <span>RegTech & Compliance</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              AML & Transaction Monitoring
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Sanctions screening (OFAC/FATF), suspicious activity reports (SAR triage), and append-only audit trail.
            </p>
          </div>

          {/* Module 7 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 7</span>
              <span>Static Security Analysis</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Smart Contract Auditor
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Static vulnerability scanner for reentrancy, access control bypasses, unchecked return values, and gas profiling.
            </p>
          </div>

          {/* Module 8 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Module 8</span>
              <span>Financial Analytics</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <LineChart className="w-4 h-4 text-sky-400" />
              Value at Risk & Stress Testing
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              Parametric & historical VaR, Maximum Drawdown calculation, and 10%/25%/50% collateral shock scenarios.
            </p>
          </div>

          {/* Modules 9 & 10 */}
          <div className="p-5 rounded-xl bg-surface border border-border hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400">Modules 9 & 10</span>
              <span>Governance & Impact</span>
            </div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-400" />
              DAO & Social Innovation
            </h3>
            <p className="text-xs text-slate-400 mt-2">
              On-chain proposal voting lifecycle plus comparative FinTech analytics (cost, speed, and inclusion metrics vs CeFi).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
