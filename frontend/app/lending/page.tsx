"use client";

import React, { useEffect, useState } from "react";
import {
  Layers,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  fetchLendingPosition,
  depositCollateral,
  borrowAsset,
  repayLoan,
  withdrawCollateral,
  LendingPosition,
} from "@/lib/api";

export default function LendingPage() {
  const [position, setPosition] = useState<LendingPosition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Form input states
  const [collateralAmount, setCollateralAmount] = useState<string>("");
  const [borrowAmount, setBorrowAmount] = useState<string>("");

  const loadPosition = async () => {
    setLoading(true);
    try {
      const pos = await fetchLendingPosition();
      setPosition(pos);
    } catch (err: any) {
      console.warn("Lending load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosition();
  }, []);

  const handleDeposit = async () => {
    const val = parseFloat(collateralAmount);
    if (!val || val <= 0) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await depositCollateral(val);
      setPosition(res.position);
      setNotice({ text: res.message });
      setCollateralAmount("");
    } catch (err: any) {
      setNotice({ text: err.message, error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(collateralAmount);
    if (!val || val <= 0) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await withdrawCollateral(val);
      setPosition(res.position);
      setNotice({ text: res.message });
      setCollateralAmount("");
    } catch (err: any) {
      setNotice({ text: err.message, error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleBorrow = async () => {
    const val = parseFloat(borrowAmount);
    if (!val || val <= 0) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await borrowAsset(val);
      setPosition(res.position);
      setNotice({ text: res.message });
      setBorrowAmount("");
    } catch (err: any) {
      setNotice({ text: err.message, error: true });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRepay = async () => {
    const val = parseFloat(borrowAmount);
    if (!val || val <= 0) return;
    setActionLoading(true);
    setNotice(null);
    try {
      const res = await repayLoan(val);
      setPosition(res.position);
      setNotice({ text: res.message });
      setBorrowAmount("");
    } catch (err: any) {
      setNotice({ text: err.message, error: true });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 font-mono">Module 2: DeFi Primitives</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Crediflex Lending Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Lending &amp; Borrowing Vault
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overcollateralized vault management, LTV monitoring, and health factor liquidation protection
          </p>
        </div>

        <button
          onClick={loadPosition}
          className="p-2 rounded-lg bg-surface border border-border text-slate-400 hover:text-white transition"
          title="Refresh Vault Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
            notice.error
              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* CREDIFLEX PROFILE ROW (Credit Score, Borrowing Power, Your Position) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Credit Score Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white text-sm">Credit Score</span>
              <span className="text-[10px] text-slate-500">Updated 5 min ago</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Based on on-chain activity</div>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-3xl font-bold text-white">
                {position ? position.credit_score : 878}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {position ? position.credit_rating : "Excellent"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-400 h-1.5 rounded-full w-[88%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
              <span>0 Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>1000 Excellent</span>
            </div>
          </div>
        </div>

        {/* Borrowing Power Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white text-sm">Borrowing Power</span>
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Maximum undercollateralized factor</div>
            <div className="text-3xl font-bold text-white mt-3">172%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
              <span>Collateral Multiplier:</span>
              <span className="font-mono text-cyan-400 font-semibold">1.72x</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <span>Dynamic borrowing cap enabled</span>
          </div>
        </div>

        {/* Your Position Card */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-white text-sm mb-1">Your Position</div>
            <div className="text-[11px] text-slate-400 mb-3">Current lending &amp; borrowing status</div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Supplied Collateral</span>
                <span className="font-mono font-semibold text-white">
                  ${position ? position.supplied_collateral_usd.toLocaleString() : "21,840.00"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Borrowed Debt</span>
                <span className="font-mono font-semibold text-amber-400">
                  ${position ? position.borrowed_usdc.toLocaleString() : "15,010.00"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-medium">Net Equity</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${position ? position.net_worth_usd.toLocaleString() : "6,830.00"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 text-right">
            Liquidation Threshold: 80%
          </div>
        </div>
      </div>

      {/* BORROW RATE & HEALTH FACTOR STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Borrow Rate Box */}
        <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Borrow Rate</div>
            <div className="text-xs text-slate-400 mt-0.5">Current algorithmic borrowing interest rate</div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">10% <span className="text-xs text-slate-400 font-normal">APR</span></div>
        </div>

        {/* Health Factor Box (Matching Crediflex orange/green gauge) */}
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between transition ${
            position && position.is_liquidation_risk
              ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
              : "bg-surface border-border text-white"
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Health Factor</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                  position && position.health_factor < 1.1
                    ? "bg-rose-500/20 text-rose-400"
                    : position && position.health_factor < 1.5
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {position && position.health_factor < 1.1 ? "Critical" : "Moderate"}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Reflects position liquidation risk (Liquidation triggers at &le; 1.0)
            </div>
          </div>
          <div
            className={`text-3xl font-bold font-mono ${
              position && position.health_factor < 1.1
                ? "text-rose-400 animate-pulse"
                : "text-amber-400"
            }`}
          >
            {position ? position.health_factor.toFixed(2) : "1.44"}
          </div>
        </div>
      </div>

      {/* LENDING & BORROWING ACTION BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Box: Collateral Management (WETH) */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Collateral Management</h3>
              <p className="text-xs text-slate-400 mt-0.5">Deposit or withdraw Ethereum collateral</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">Asset: WETH</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Deposited Balance</span>
              <span className="font-mono text-white font-semibold">
                {position ? position.supplied_collateral_eth : 7.0} WETH
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Collateral Valuation</span>
              <span className="font-mono text-white">
                ${position ? position.supplied_collateral_usd.toLocaleString() : "21,840.00"} USD
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount (WETH)
            </label>
            <input
              type="number"
              step="0.1"
              value={collateralAmount}
              onChange={(e) => setCollateralAmount(e.target.value)}
              placeholder="e.g. 1.5"
              className="w-full bg-slate-950 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDeposit}
              disabled={actionLoading}
              className="py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
            >
              Deposit WETH
            </button>
            <button
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="py-2.5 rounded-lg bg-surface border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-xs transition disabled:opacity-50"
            >
              Withdraw WETH
            </button>
          </div>
        </div>

        {/* Right Box: Borrow & Repay (USDC) */}
        <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Borrow &amp; Repay Debt</h3>
              <p className="text-xs text-slate-400 mt-0.5">Borrow against collateral up to 75% LTV</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Asset: USDC</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Borrowed Balance</span>
              <span className="font-mono text-amber-400 font-semibold">
                ${position ? position.borrowed_usdc.toLocaleString() : "15,010.00"} USDC
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Available to Borrow</span>
              <span className="font-mono text-emerald-400 font-semibold">
                ${position ? position.available_to_borrow_usdc.toLocaleString() : "1,370.00"} USDC
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount (USDC)
            </label>
            <input
              type="number"
              step="100"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              placeholder="e.g. 500"
              className="w-full bg-slate-950 border border-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleBorrow}
              disabled={actionLoading}
              className="py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
            >
              Borrow USDC
            </button>
            <button
              onClick={handleRepay}
              disabled={actionLoading}
              className="py-2.5 rounded-lg bg-surface border border-slate-700 hover:border-slate-500 text-slate-200 font-semibold text-xs transition disabled:opacity-50"
            >
              Repay USDC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
