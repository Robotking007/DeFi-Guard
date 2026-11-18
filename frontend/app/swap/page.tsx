"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchLiquidityPools,
  fetchSwapQuote,
  executeSwapTransaction,
  calculateImpermanentLoss,
  calculateDyDxPerpRisk,
  fetchDukeProtocolsStudy,
  LiquidityPoolInfo,
  SwapQuoteResponse,
  SwapExecuteResponse,
  ImpermanentLossResponse,
  DyDxPerpRiskResponse,
  DukeProtocolStudy,
} from "../../lib/api";

export default function SwapPage() {
  const [activeTab, setActiveTab] = useState<"SWAP" | "POOLS" | "DUKE_PROTOCOLS" | "DYDX">("SWAP");

  // Swap State
  const [tokenIn, setTokenIn] = useState("ETH");
  const [tokenOut, setTokenOut] = useState("USDC");
  const [amountIn, setAmountIn] = useState<number>(1.0);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [quote, setQuote] = useState<SwapQuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [swapLoading, setSwapLoading] = useState(false);
  const [lastTx, setLastTx] = useState<SwapExecuteResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pools State
  const [pools, setPools] = useState<LiquidityPoolInfo[]>([]);

  // Impermanent Loss State
  const [priceChangeA, setPriceChangeA] = useState<number>(50);
  const [ilResult, setIlResult] = useState<ImpermanentLossResponse | null>(null);

  // dYdX Derivatives State
  const [posType, setPosType] = useState<"LONG" | "SHORT">("LONG");
  const [entryPrice, setEntryPrice] = useState<number>(3100);
  const [collateral, setCollateral] = useState<number>(1000);
  const [leverage, setLeverage] = useState<number>(10);
  const [dydxResult, setDydxResult] = useState<DyDxPerpRiskResponse | null>(null);

  // Duke Protocols State
  const [dukeProtocols, setDukeProtocols] = useState<DukeProtocolStudy[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (amountIn > 0) {
      updateQuote();
    }
  }, [tokenIn, tokenOut, amountIn, slippage]);

  async function loadInitialData() {
    try {
      const [p, d] = await Promise.all([fetchLiquidityPools(), fetchDukeProtocolsStudy()]);
      setPools(p);
      setDukeProtocols(d);
      // Run default IL and dYdX calculations
      const il = await calculateImpermanentLoss(50, 0);
      setIlResult(il);
      const dydx = await calculateDyDxPerpRisk({
        position_type: "LONG",
        entry_price_usd: 3100,
        collateral_usd: 1000,
        leverage: 10,
      });
      setDydxResult(dydx);
    } catch (e: any) {
      console.warn("Could not load initial AMM data:", e);
    }
  }

  async function updateQuote() {
    setQuoteLoading(true);
    setErrorMsg(null);
    try {
      const q = await fetchSwapQuote(tokenIn, tokenOut, Number(amountIn), slippage);
      setQuote(q);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch quote");
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleExecuteSwap() {
    if (!quote) return;
    setSwapLoading(true);
    setErrorMsg(null);
    try {
      const res = await executeSwapTransaction(
        tokenIn,
        tokenOut,
        Number(amountIn),
        quote.minimum_amount_out
      );
      setLastTx(res);
      // Refresh quote and pools
      updateQuote();
      const updatedPools = await fetchLiquidityPools();
      setPools(updatedPools);
    } catch (err: any) {
      setErrorMsg(err.message || "Swap execution failed");
    } finally {
      setSwapLoading(false);
    }
  }

  async function handleRecalcIL(changeVal: number) {
    setPriceChangeA(changeVal);
    try {
      const res = await calculateImpermanentLoss(changeVal, 0);
      setIlResult(res);
    } catch (err: any) {
      console.error(err);
    }
  }

  async function handleRecalcDyDx(newLev?: number, newPos?: "LONG" | "SHORT", newEntry?: number, newCollateral?: number) {
    const lev = newLev !== undefined ? newLev : leverage;
    const pos = newPos !== undefined ? newPos : posType;
    const ent = newEntry !== undefined ? newEntry : entryPrice;
    const col = newCollateral !== undefined ? newCollateral : collateral;

    try {
      const res = await calculateDyDxPerpRisk({
        position_type: pos,
        entry_price_usd: Number(ent),
        collateral_usd: Number(col),
        leverage: Number(lev),
      });
      setDydxResult(res);
    } catch (err: any) {
      console.error(err);
    }
  }

  function handleSwapDirection() {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-8 bg-gradient-to-b from-pink-500 to-indigo-600 rounded-full inline-block"></span>
              OCSWAP AMM & Duke Protocol Analyzer
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30">
              Modules 3 & 4
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Constant-product AMM swaps ($x \cdot y = k$), Impermanent Loss modeling, and Duke DeFi Specialization protocol comparisons (MakerDAO, Compound, Aave, Uniswap, dYdX).
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {[
            { id: "SWAP", label: "OCSWAP DEX" },
            { id: "POOLS", label: "Liquidity & IL" },
            { id: "DUKE_PROTOCOLS", label: "Duke 5 Protocols" },
            { id: "DYDX", label: "dYdX Perpetuals" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* TAB 1: OCSWAP AMM DEX (Image 3 Reference) */}
      {activeTab === "SWAP" && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
                Swap Tokens
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Slippage:</span>
                {[0.1, 0.5, 1.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                      slippage === s
                        ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>

            {/* Token In Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>You Pay</span>
                <span>Balance: ~10.0 {tokenIn}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <input
                  type="number"
                  step="any"
                  value={amountIn}
                  onChange={(e) => setAmountIn(parseFloat(e.target.value) || 0)}
                  className="bg-transparent text-2xl font-bold text-white w-full focus:outline-none"
                  placeholder="0.0"
                />
                <select
                  value={tokenIn}
                  onChange={(e) => setTokenIn(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
                >
                  <option value="ETH">ETH</option>
                  <option value="USDC">USDC</option>
                  <option value="WBTC">WBTC</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
            </div>

            {/* Swap Flip Arrow */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition shadow-md"
              >
                ⇅
              </button>
            </div>

            {/* Token Out Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>You Receive (Estimated)</span>
                {quoteLoading && <span className="text-pink-400 animate-pulse text-[11px]">Computing quote...</span>}
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-2xl font-bold text-white truncate">
                  {quote ? quote.expected_amount_out.toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.0"}
                </div>
                <select
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500"
                >
                  <option value="USDC">USDC</option>
                  <option value="ETH">ETH</option>
                  <option value="WBTC">WBTC</option>
                  <option value="DAI">DAI</option>
                </select>
              </div>
            </div>

            {/* Quote Details Breakdown */}
            {quote && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs space-y-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span className="font-mono text-slate-200">
                    1 {tokenIn} = {quote.execution_price.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenOut}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact</span>
                  <span
                    className={`font-mono font-bold ${
                      quote.price_impact_percent > 3
                        ? "text-rose-400"
                        : quote.price_impact_percent > 1
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {quote.price_impact_percent.toFixed(3)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Received (after {slippage}% slippage)</span>
                  <span className="font-mono text-slate-200">
                    {quote.minimum_amount_out.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenOut}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Liquidity Provider Fee (0.3%)</span>
                  <span className="font-mono text-slate-200">
                    {quote.lp_fee_amount} {tokenIn}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-500">
                  <span>Constant Product Invariant (k)</span>
                  <span className="font-mono truncate max-w-[200px]">{quote.constant_product_k.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Execute Swap Button */}
            <button
              onClick={handleExecuteSwap}
              disabled={swapLoading || quoteLoading || amountIn <= 0}
              className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl transition shadow-xl shadow-pink-600/20"
            >
              {swapLoading ? "Confirming on-chain swap..." : `Swap ${tokenIn} for ${tokenOut}`}
            </button>
          </div>

          {/* Last Transaction Receipt Card */}
          {lastTx && (
            <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-300">
                <span>✓ Swap Confirmed On-Chain</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase text-[10px]">
                  {lastTx.status}
                </span>
              </div>
              <div className="text-slate-300">
                Swapped <span className="font-bold text-white">{lastTx.amount_in} {lastTx.token_in}</span> for{" "}
                <span className="font-bold text-white">{lastTx.amount_out_received.toFixed(4)} {lastTx.token_out}</span>.
              </div>
              <div className="font-mono text-[11px] text-slate-400 truncate">
                Tx: {lastTx.tx_hash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Liquidity Pools & Impermanent Loss Simulator */}
      {activeTab === "POOLS" && (
        <div className="space-y-6">
          {/* Pools List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pools.map((p) => (
              <div key={p.pool_name} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-base">{p.pool_name}</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {p.apy_percent}% APY
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Reserve {p.token_a}:</span>
                    <span className="font-mono text-white">{p.reserve_a.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserve {p.token_b}:</span>
                    <span className="font-mono text-white">{p.reserve_b.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Liquidity:</span>
                    <span className="font-mono text-slate-200">${p.total_liquidity_usd.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>24h Volume:</span>
                    <span className="font-mono text-slate-200">${p.volume_24h_usd.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Impermanent Loss Sandbox */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Impermanent Loss (IL) Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical modeling of divergent asset prices on constant-product AMM liquidity providers:{" "}
                <span className="font-mono text-pink-400">IL = 2√(k) / (1 + k) - 1</span>
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Asset A Price Change:</span>
                <span className="font-bold text-white font-mono text-sm">
                  {priceChangeA >= 0 ? `+${priceChangeA}%` : `${priceChangeA}%`}
                </span>
              </div>
              <input
                type="range"
                min="-80"
                max="300"
                value={priceChangeA}
                onChange={(e) => handleRecalcIL(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>-80% (Crash)</span>
                <span>0% (Stable)</span>
                <span>+100% (2x)</span>
                <span>+300% (4x)</span>
              </div>
            </div>

            {ilResult && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Impermanent Loss</span>
                  <div className="text-xl font-bold text-rose-400 font-mono mt-1">
                    -{ilResult.impermanent_loss_percent.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Pool Value ($10k base)</span>
                  <div className="text-xl font-bold text-white font-mono mt-1">
                    ${ilResult.pool_hold_value_usd.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Hold Outside Pool (HODL)</span>
                  <div className="text-xl font-bold text-slate-200 font-mono mt-1">
                    ${ilResult.hoddle_value_usd.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Net IL Arbitrage Drag</span>
                  <div className="text-xl font-bold text-amber-400 font-mono mt-1">
                    ${ilResult.net_difference_usd.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Duke Specialization Protocol Deep Dive */}
      {activeTab === "DUKE_PROTOCOLS" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
            <span className="font-bold text-indigo-300">Duke University DeFi Specialization Protocols:</span> The curriculum specifically analyzes these five foundational decentralized protocols for collateral management, interest rate determination, liquidity pooling, invariant pricing, and derivative risk.
          </div>

          <div className="grid grid-cols-1 gap-5">
            {dukeProtocols.map((p) => (
              <div key={p.protocol} className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
                      {p.protocol}
                    </h3>
                    <p className="text-xs text-indigo-400 font-medium">{p.duke_module}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                    {p.core_mechanism}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                      Core Mathematical Invariant
                    </span>
                    <div className="font-mono text-sm text-pink-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      {p.math_formula}
                    </div>
                    <p className="text-slate-400 text-[11px] pt-1">{p.live_risk_implications}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                      Key Governance & Risk Parameters
                    </span>
                    <div className="space-y-1.5 text-[11px]">
                      {Object.entries(p.key_parameters).map(([k, val]) => (
                        <div key={k} className="flex justify-between border-b border-slate-900 pb-1">
                          <span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}:</span>
                          <span className="font-mono text-white font-semibold">
                            {Array.isArray(val) ? val.join(", ") : String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: dYdX Derivatives & Perpetual Margin Risk Simulator */}
      {activeTab === "DYDX" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                dYdX Perpetual Futures & Margin Risk Simulator
              </h2>
              <p className="text-xs text-slate-400">
                Calculates isolated/cross margin requirements, liquidation price thresholds, and 8-hour funding rates.
              </p>
            </div>

            {/* Position Direction & Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPosType("LONG");
                  handleRecalcDyDx(undefined, "LONG");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  posType === "LONG"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800"
                }`}
              >
                LONG (Bullish)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPosType("SHORT");
                  handleRecalcDyDx(undefined, "SHORT");
                }}
                className={`py-2 rounded-xl text-xs font-bold transition ${
                  posType === "SHORT"
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                    : "bg-slate-950 text-slate-400 border border-slate-800"
                }`}
              >
                SHORT (Bearish)
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Entry Price (USD)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => {
                    setEntryPrice(Number(e.target.value));
                    handleRecalcDyDx(undefined, undefined, Number(e.target.value));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Collateral Margin (USDC)</label>
                <input
                  type="number"
                  value={collateral}
                  onChange={(e) => {
                    setCollateral(Number(e.target.value));
                    handleRecalcDyDx(undefined, undefined, undefined, Number(e.target.value));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Leverage:</span>
                <span className="font-bold text-indigo-400 font-mono text-sm">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={leverage}
                onChange={(e) => {
                  setLeverage(Number(e.target.value));
                  handleRecalcDyDx(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>1x (Spot)</span>
                <span>5x</span>
                <span>10x</span>
                <span>20x</span>
                <span>25x (Max)</span>
              </div>
            </div>

            {/* dYdX Risk Metrics Output */}
            {dydxResult && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Risk Assessment:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      dydxResult.distance_to_liquidation_percent < 5
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : dydxResult.distance_to_liquidation_percent < 15
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {dydxResult.risk_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase">Position Size</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      ${dydxResult.position_size_usd.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase">Estimated Liquidation Price</span>
                    <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                      ${dydxResult.liquidation_price_usd.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase">Distance to Liquidation</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      {dydxResult.distance_to_liquidation_percent.toFixed(2)}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px] uppercase">Daily Funding Fee</span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">
                      ${dydxResult.est_funding_fee_daily_usd.toFixed(2)}
                    </div>
                  </div>
                </div>

                <p className="text-slate-400 text-[11px] border-t border-slate-900 pt-2">
                  <span className="font-semibold text-slate-300">Remediation:</span> {dydxResult.remediation_advice}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
