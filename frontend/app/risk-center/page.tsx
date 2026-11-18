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
  Workflow,
  Play,
  ExternalLink,
} from "lucide-react";
import {
  fetchRiskOverview,
  analyzeRisk,
  RiskOverviewStats,
  RiskAnalysisResponse,
  fetchTransactions,
  TransactionItem,
  fetchAirflowDAGs,
  triggerAirflowDAG,
  AirflowDAGInfo,
  AirflowRunResponse,
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

  // Airflow Pipeline state
  const [airflowDags, setAirflowDags] = useState<AirflowDAGInfo[]>([]);
  const [triggeringDag, setTriggeringDag] = useState<string | null>(null);
  const [airflowRunResult, setAirflowRunResult] = useState<AirflowRunResponse | null>(null);
  const [airflowFeedback, setAirflowFeedback] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchRiskOverview().catch(() => null),
      fetchTransactions(1, 10).catch(() => null),
      fetchAirflowDAGs().catch(() => []),
    ]).then(([overviewData, txData, dagsData]) => {
      if (overviewData) setStats(overviewData);
      if (txData && txData.items.length > 0) {
        setRecentTxs(txData.items);
        setSelectedTxId(txData.items[0].id);
      }
      if (dagsData && dagsData.length > 0) {
        setAirflowDags(dagsData);
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

  const handleTriggerAirflow = async (dagId: string) => {
    setTriggeringDag(dagId);
    setAirflowFeedback(null);
    try {
      const res = await triggerAirflowDAG(dagId);
      setAirflowRunResult(res);
      setAirflowFeedback(`Airflow DAG '${dagId}' executed successfully! Run ID: ${res.dag_run_id}`);
    } catch (err: any) {
      alert("Failed to trigger Airflow DAG: " + err.message);
    } finally {
      setTriggeringDag(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Module 5
            </span>
            <span className="text-xs text-slate-400 font-mono">BlockBuster Risk Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            AI Anomaly & Fraud Risk Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Unsupervised Isolation Forest ML anomaly detection orchestrated via <span className="text-indigo-400 font-semibold">Apache Airflow</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Model:</span>
            <span className="font-mono text-white font-semibold">
              {stats?.model_version || "IsolationForest-v1.0"}
            </span>
          </div>
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition"
          >
            <Workflow className="w-3.5 h-3.5 text-indigo-400" />
            <span>Airflow Webserver (8080)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Transactions Scanned</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {stats ? stats.total_transactions_analyzed : "33"}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Live telemetry pipeline</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Flagged Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2 font-mono">
            {stats ? stats.flagged_anomalies : "8"}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1">
            {stats ? stats.anomaly_rate_percent : "24.2"}% anomaly rate
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Critical Compliance Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2 font-mono">
            {stats ? stats.critical_alerts : "3"}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Action required (OFAC/Tornado)</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Threat Score</span>
            <TrendingDown className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-2 font-mono">
            {stats ? stats.average_risk_score : "14.5"}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Calibrated isolation depth</div>
        </div>
      </div>

      {/* APACHE AIRFLOW ML PIPELINE ORCHESTRATION CARD */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30 border border-indigo-500/30 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Apache Airflow MLOps & Model Retraining DAGs
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Airflow 2.8+
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated DAGs for scheduled on-chain transaction ingestion, feature engineering, Isolation Forest retraining, drift benchmarking, and batch inference.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2"></span>
              Airflow Scheduler: Online
            </span>
          </div>
        </div>

        {airflowFeedback && (
          <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between">
            <span>{airflowFeedback}</span>
            <button onClick={() => setAirflowFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* Registered DAGs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {airflowDags.map((dag) => (
            <div
              key={dag.dag_id}
              className="p-5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-white text-xs">{dag.dag_id}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {dag.schedule_interval}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">{dag.description}</p>

                {/* DAG Task Nodes Visualization */}
                <div className="mt-4 pt-3 border-t border-slate-900 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    DAG Pipeline Task Flow ({dag.tasks.length} Tasks)
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {dag.tasks.map((task, idx) => (
                      <React.Fragment key={task.task_id}>
                        <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-slate-300">
                          {task.task_id}
                        </span>
                        {idx < dag.tasks.length - 1 && (
                          <span className="text-slate-600 font-bold">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Last State: <span className="text-emerald-400 font-semibold uppercase">{dag.last_run_state}</span>
                </span>
                <button
                  onClick={() => handleTriggerAirflow(dag.dag_id)}
                  disabled={triggeringDag === dag.dag_id}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{triggeringDag === dag.dag_id ? "Executing DAG..." : "Trigger Airflow DAG"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Live Airflow Execution Logs output */}
        {airflowRunResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-2">
              <span className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Airflow Execution Stream: {airflowRunResult.dag_id}
              </span>
              <span className="font-mono text-slate-400">{airflowRunResult.dag_run_id}</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              {airflowRunResult.task_logs.map((log, i) => (
                <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800/80 flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-emerald-500/20 text-emerald-300">
                    {log.status}
                  </span>
                  <span className="text-indigo-300 font-semibold">[{log.task}]:</span>
                  <span className="text-slate-300">{log.log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transaction & Address Risk Audit Sandbox */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-cyan-400" />
              Interactive Transaction Risk Auditor
            </h2>
            <p className="text-xs text-slate-400">
              Run real-time ML feature extraction and Isolation Forest inference on any transaction.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Select Recent Transaction</label>
            <select
              value={selectedTxId}
              onChange={(e) => {
                setSelectedTxId(e.target.value);
                setWalletInput("");
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {recentTxs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.tx_hash.slice(0, 10)}... | {t.amount} {t.asset_symbol} ({t.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Or Audit Target Wallet Address</label>
            <input
              type="text"
              value={walletInput}
              onChange={(e) => {
                setWalletInput(e.target.value);
                setSelectedTxId("");
              }}
              placeholder="0x..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunAudit}
            disabled={analyzing}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-600/20"
          >
            {analyzing ? "Running Isolation Forest..." : "Run AI Risk Audit"}
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
