"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  AlertOctagon,
  ShieldAlert,
  Sparkles,
  PieChart,
  Activity,
  ArrowRight,
  RefreshCw,
  Zap,
} from "lucide-react";
import {
  fetchPortfolioMetrics,
  runStressTest,
  PortfolioMetrics,
  StressTestResult,
} from "@/lib/api";

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stressLoading, setStressLoading] = useState<boolean>(false);
  const [stressResult, setStressResult] = useState<StressTestResult | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolioMetrics();
      setMetrics(data);
    } catch (err: any) {
      console.warn("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Pre-run a 10% test for initial preview
    runStressTest(-10.0, "10% Market Correction")
      .then(setStressResult)
      .catch(() => null);
  }, []);

  const handleRunScenario = async (shock: number, label: string) => {
    setStressLoading(true);
    try {
      const res = await runStressTest(shock, label);
      setStressResult(res);
    } catch (err: any) {
      console.error("Stress test failed:", err);
    } finally {
      setStressLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 font-mono">Module 8: FinTech Risk Management</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Themon Portfolio Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Financial Risk Analytics &amp; Stress Testing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Portfolio Value at Risk (VaR), Maximum Drawdown, and interactive market crash simulations
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-lg bg-surface border border-border text-slate-400 hover:text-white transition"
          title="Refresh Metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* THEMON PORTFOLIO VALUE & ASSET ALLOCATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Total Portfolio Value & Trajectory */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">Total Portfolio Value</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono">
                <span>1D</span>
                <span>1W</span>
                <span className="text-emerald-400 font-bold">1M</span>
                <span>1Y</span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                ${metrics ? metrics.total_portfolio_value_usd.toLocaleString() : "124,872.39"}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
                +$3,420.18 (+2.8%)
              </span>
            </div>
          </div>

          {/* Green Trajectory Wave SVG */}
          <div className="h-44 w-full relative mt-6 pt-4">
            <svg className="w-full h-full text-emerald-500/15" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path
                d="M0,80 Q15,40 30,65 T60,30 T85,45 T100,15 L100,100 L0,100 Z"
                fill="currentColor"
              />
              <path
                d="M0,80 Q15,40 30,65 T60,30 T85,45 T100,15"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
            </svg>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-2">
              <span>28 Jun</span>
              <span>7 Jul</span>
              <span>14 Jul</span>
              <span>21 Jul</span>
              <span>28 Jul</span>
              <span className="text-white font-semibold">Today</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Asset Allocation (Themon progress bars) */}
        <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">ASSET ALLOCATION</h3>
              <PieChart className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-4">
              {metrics ? (
                metrics.allocations.map((a) => (
                  <div key={a.symbol} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.color }} />
                        <span className="font-semibold text-white">{a.symbol}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-300">${a.value_usd.toLocaleString()}</span>
                        <span className="text-slate-500 w-10 text-right">{a.allocation_percent}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${a.allocation_percent}%`,
                          backgroundColor: a.color,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">Loading allocation data...</div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Concentration Risk: Low</span>
            <span className="text-emerald-400">Diversified</span>
          </div>
        </div>
      </div>

      {/* RISK GAUGES (VaR 95%, VaR 99%, Max Drawdown) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="text-[11px] text-slate-400">Value at Risk (VaR 95% - 1 Day)</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">$14,210.00</div>
          <div className="text-[11px] text-slate-500 mt-1">95% confidence max daily loss buffer</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="text-[11px] text-amber-400">Value at Risk (VaR 99% - Extreme)</div>
          <div className="text-2xl font-bold text-amber-300 font-mono mt-1">$26,850.00</div>
          <div className="text-[11px] text-slate-500 mt-1">99% confidence tail-risk capital loss</div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border">
          <div className="text-[11px] text-slate-400">Maximum Drawdown (MDD)</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">18.4%</div>
          <div className="text-[11px] text-slate-500 mt-1">Largest peak-to-trough decline in 365d</div>
        </div>
      </div>

      {/* INTERACTIVE STRESS TESTING SANDBOX */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Dynamic DeFi Stress-Testing Sandbox
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate collateral liquidity crunches and market collapse shocks to test protocol solvency
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Formula: HealthFactor = (Collateral &times; 0.8) / Debt</span>
        </div>

        {/* Shock Scenario Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleRunScenario(-10.0, "10% Market Correction")}
            disabled={stressLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-white flex items-center justify-between">
              <span>-10% Market Drop</span>
              <span className="text-[10px] text-emerald-400 font-normal">Moderate</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Ordinary weekly volatility pullback</div>
          </button>

          <button
            onClick={() => handleRunScenario(-25.0, "25% Severe Collateral Drawdown")}
            disabled={stressLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-white flex items-center justify-between">
              <span>-25% Severe Drop</span>
              <span className="text-[10px] text-amber-400 font-normal">Elevated</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Macro crypto liquidation cascade</div>
          </button>

          <button
            onClick={() => handleRunScenario(-50.0, "50% Black Swan Liquidity Crash")}
            disabled={stressLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-left transition"
          >
            <div className="text-xs font-semibold text-white flex items-center justify-between">
              <span>-50% Black Swan</span>
              <span className="text-[10px] text-rose-400 font-normal">Critical</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Extreme systemic insolvency shock</div>
          </button>
        </div>

        {/* Live Simulation Output Panel */}
        {stressResult && (
          <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span>Simulation Result:</span>
                <span className="font-mono text-cyan-400">{stressResult.scenario_label}</span>
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  stressResult.liquidation_triggered
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {stressResult.liquidation_triggered ? "Liquidation Cascaded" : "Solvent & Healthy"}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">STRESSED PORTFOLIO</div>
                <div className="font-bold text-white text-sm font-mono mt-0.5">
                  ${stressResult.stressed_portfolio_value.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">ESTIMATED VALUE LOSS</div>
                <div className="font-bold text-rose-400 text-sm font-mono mt-0.5">
                  -${stressResult.value_loss_usd.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">RECALCULATED HEALTH FACTOR</div>
                <div
                  className={`font-bold text-sm font-mono mt-0.5 ${
                    stressResult.stressed_health_factor <= 1.0
                      ? "text-rose-400"
                      : "text-amber-400"
                  }`}
                >
                  {stressResult.stressed_health_factor.toFixed(2)} (was {stressResult.original_health_factor.toFixed(2)})
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="text-slate-500 text-[10px]">CAPITAL AT RISK</div>
                <div className="font-bold text-amber-400 text-sm font-mono mt-0.5">
                  ${stressResult.capital_at_risk_usd.toLocaleString()}
                </div>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                stressResult.liquidation_triggered
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-slate-900 border-slate-800 text-slate-300"
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{stressResult.remediation_advice}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
