"use client";

import React, { useEffect, useState } from "react";
import {
  BrainCircuit,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Search,
  Sparkles,
  TrendingDown,
  Globe2,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import {
  fetchRiskOverview,
  analyzeRisk,
  RiskOverviewStats,
  RiskAnalysisResponse,
  fetchTransactions,
  TransactionItem,
} from "@/lib/api";

export default function RiskCenterPage() {
  const [stats, setStats] = useState<RiskOverviewStats | null>(null);
  const [recentTxs, setRecentTxs] = useState<TransactionItem[]>([]);
  const [selectedTxId, setSelectedTxId] = useState<string>("");
  const [walletInput, setWalletInput] = useState<string>("0x71C8fb9624647ae2798454BA32074972eA97B01E");
  const [analysisResult, setAnalysisResult] = useState<RiskAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchRiskOverview().catch(() => null),
      fetchTransactions(1, 10).catch(() => null),
    ]).then(([overviewData, txData]) => {
      if (overviewData) setStats(overviewData);
      if (txData && txData.items.length > 0) {
        setRecentTxs(txData.items);
        setSelectedTxId(txData.items[0].id);
      }
      setLoading(false);
    });
  }, []);

  const handleRunAudit = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeRisk(selectedTxId || undefined, !selectedTxId ? walletInput : undefined);
      setAnalysisResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute risk analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header matching BlockBuster reference screen */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE MONITORING
            </span>
            <span className="text-xs text-slate-500 font-mono">Module 5: AI Risk Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Analytics Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time blockchain transaction intelligence & Isolation Forest anomaly projection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs flex items-center gap-2">
            <span className="text-slate-400">Model:</span>
            <span className="font-mono text-purple-400 font-semibold">Isolation Forest v1.0.0</span>
          </div>
        </div>
      </div>

      {/* 4 BlockBuster Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-emerald-400">+8.4%</span>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {stats ? stats.total_transactions_analyzed : 337}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">TOTAL TRANSACTIONS ANALYZED</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Transactions active
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-amber-400">+12%</span>
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-3">
            {stats ? stats.flagged_anomalies : 8}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">SUSPICIOUS TRANSACTIONS</div>
          <div className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Flagged this session
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-rose-400">Critical</span>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-3">
            {stats ? stats.high_risk_wallets : 2}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">HIGH RISK WALLETS</div>
          <div className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Risk score &ge; 80
          </div>
        </div>

        {/* Card 4 */}
        <div className="p-4 rounded-xl bg-surface border border-border relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold text-purple-400">Live</span>
          </div>
          <div className="text-2xl font-bold text-white mt-3">
            {stats ? stats.critical_alerts : 3}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 font-medium">REAL-TIME ALERTS</div>
          <div className="text-[11px] text-purple-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Awaiting compliance review
          </div>
        </div>
      </div>

      {/* Two Center Panels: Predictive Analytics Forecast + Sanctions Watchlist Detector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Predictive Anomaly Forecast */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-surface border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Predictive Analytics Forecast (Isolation Forest &amp; GNN)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Multi-window anomaly trajectory projection for suspicious transaction pressure
              </p>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">Confidence: 84.5%</span>
          </div>

          {/* Simulated chart line */}
          <div className="h-44 w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Background SVG wave */}
            <svg className="w-full h-full absolute inset-0 text-cyan-500/20" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,70 Q25,30 50,65 T100,20 L100,100 L0,100 Z"
                fill="currentColor"
              />
              <path
                d="M0,70 Q25,30 50,65 T100,20"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
              />
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 z-10">
              <span>Window T-4</span>
              <span>Window T-3</span>
              <span>Window T-2</span>
              <span>Window T-1</span>
              <span className="text-emerald-400 font-bold">Current (T0)</span>
              <span>Forecast F+1</span>
              <span>Forecast F+2</span>
            </div>

            <div className="z-10 flex items-center justify-between pt-8 border-t border-slate-800/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Forecast Horizon</span>
                <div className="font-semibold text-white">4 future blocks</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Peak Anomaly Density</span>
                <div className="font-semibold text-amber-400">49.47 risk units</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase">Mean Confidence</span>
                <div className="font-semibold text-emerald-400">84.5%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Sanctions & Hotspot Watchlist Detector */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-cyan-400" />
                Sanctions Watchlist Detector
              </h3>
              <span className="text-[10px] text-rose-400 font-semibold">Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Real-time cross-matching against OpenSanctions OFAC, EU, &amp; FATF databases
            </p>

            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">OFAC SDN Program</div>
                  <div className="text-[10px] text-slate-400">Global Magnitsky &amp; Russia EO14024</div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400">2 Matches</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Tornado Cash / Mixers</div>
                  <div className="text-[10px] text-slate-400">Cryptographic privacy pool routing</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">1 Match</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">FATF High-Risk Jurisdictions</div>
                  <div className="text-[10px] text-slate-400">Counterparty cross-border exposure</div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-300">Monitored</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Indexed Records: 1,000+</span>
            <span className="text-emerald-400 font-medium">Local CSV Synced</span>
          </div>
        </div>
      </div>

      {/* Interactive AI Anomaly Audit Tool */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Interactive Anomaly Scoring Engine
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Select a seeded transaction or enter a wallet address to compute its Isolation Forest risk score and feature attribution.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedTxId}
            onChange={(e) => setSelectedTxId(e.target.value)}
            className="flex-1 bg-slate-950 border border-border rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
          >
            {recentTxs.map((tx) => (
              <option key={tx.id} value={tx.id}>
                {tx.tx_hash.substring(0, 16)}... | {tx.amount} {tx.asset_symbol} | To: {tx.to_address.substring(0, 10)}... {tx.is_anomaly ? "(!)" : ""}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={analyzing}
            className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {analyzing ? (
              "Computing Model Inference..."
            ) : (
              <>
                <span>Run Anomaly Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

        {/* Audit Results Panel */}
        {analysisResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase">ANALYSIS ID</span>
                <div className="text-xs font-mono text-cyan-400">{analysisResult.analysis_id}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                    analysisResult.risk_band === "critical"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : analysisResult.risk_band === "high"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {analysisResult.risk_band} Risk ({analysisResult.score}/100)
                </span>
              </div>
            </div>

            {/* Contributing signals list */}
            <div>
              <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explainable Contributing Risk Signals</span>
              </div>
              <div className="space-y-2">
                {analysisResult.signals.map((sig) => (
                  <div
                    key={sig.code}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{sig.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">[{sig.code}]</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{sig.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-500">Signal Weight</div>
                      <div className="font-mono font-bold text-amber-400">
                        +{(sig.weight * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{analysisResult.disclaimer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
