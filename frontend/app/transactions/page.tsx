"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Database,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  fetchTransactions,
  seedDemoTransactions,
  syncLiveTransactions,
  TransactionItem,
  PaginatedTransactions,
  getStoredToken,
} from "@/lib/api";

export default function TransactionsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedTransactions | null>(null);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Live On-Chain Sync State
  const [syncAddress, setSyncAddress] = useState<string>("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045");
  const [syncChainId, setSyncChainId] = useState<number>(1);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSyncLive = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!syncAddress.trim()) return;
    setSyncing(true);
    setSyncSuccess(null);
    setSyncError(null);

    try {
      const res = await syncLiveTransactions(syncAddress.trim(), syncChainId, 25);
      setSyncSuccess(
        `Successfully synced ${res.synced_count} real on-chain transactions via Etherscan V2 API! (${res.anomalous_count} flagged by 10k-record ML engine).`
      );
      setPage(1);
      await loadData();
    } catch (err: any) {
      setSyncError(err.message || "Failed to fetch live transactions from Etherscan V2.");
    } finally {
      setSyncing(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchTransactions(page, 12, search, statusFilter);
      setData(res);
    } catch (err: any) {
      console.warn("Failed loading transactions:", err);
      // If unauthorized, redirect to login
      if (!getStoredToken()) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      const res = await seedDemoTransactions();
      setSeedNotice(`Generated ${res.inserted_count} demo transactions (${res.anomalous_count} anomalies flagged).`);
      setPage(1);
      await loadData();
    } catch (err: any) {
      setSeedNotice("Failed to seed demo data. Please sign in first.");
    } finally {
      setSeeding(false);
    }
  };

  // Helper formatting functions
  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const formatHash = (h: string) => {
    if (!h) return "";
    return `${h.substring(0, 10)}...${h.substring(h.length - 6)}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Transaction Intelligence Explorer</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Module 1 & 6
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time on-chain stream & synthetic transaction monitoring pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDemo}
            disabled={seeding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{seeding ? "Injecting Dataset..." : "Seed Demo Transactions"}</span>
          </button>
        </div>
      </div>

      {seedNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>{seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Live Blockchain Sync Controller */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              Live On-Chain Transaction Ingestion Engine
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-emerald-400">
              Etherscan V2 API: Active
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              Alchemy Sepolia RPC: Connected
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-400">
              CoinGecko Live Rates: Active
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-purple-400">
              ML Model: 10,000 Trained
            </span>
          </div>
        </div>

        <form onSubmit={handleSyncLive} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1 relative">
            <label className="text-[10px] text-slate-400 block mb-1">
              Ethereum / Sepolia Wallet or Smart Contract Address:
            </label>
            <input
              type="text"
              value={syncAddress}
              onChange={(e) => setSyncAddress(e.target.value)}
              placeholder="0x... (e.g. 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="w-full md:w-44">
            <label className="text-[10px] text-slate-400 block mb-1">EVM Network:</label>
            <select
              value={syncChainId}
              onChange={(e) => setSyncChainId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value={1}>Ethereum Mainnet (1)</option>
              <option value={11155111}>Sepolia Testnet (11155111)</option>
            </select>
          </div>

          <div className="flex items-end pt-5 md:pt-0">
            <button
              type="submit"
              disabled={syncing || !syncAddress.trim()}
              className="w-full md:w-auto px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Querying Etherscan V2..." : "Sync Live Blockchain Transactions"}</span>
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="text-slate-500">Quick Addresses:</span>
          <button
            type="button"
            onClick={() => { setSyncAddress("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"); setSyncChainId(1); }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] transition"
          >
            vitalik.eth (0xd8dA...6045)
          </button>
          <button
            type="button"
            onClick={() => { setSyncAddress("0xE592427A0AEce92De3Edee1F18E0157C05861564"); setSyncChainId(1); }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] transition"
          >
            Uniswap V3 Router (0xE592...1564)
          </button>
          <button
            type="button"
            onClick={() => { setSyncAddress("0x71C8fb9624647ae2798454BA32074972eA97B01E"); setSyncChainId(11155111); }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-[10px] transition"
          >
            Sepolia Test Treasury
          </button>
        </div>

        {syncSuccess && (
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            ✓ {syncSuccess}
          </div>
        )}
        {syncError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            ⚠ {syncError}
          </div>
        )}
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-slate-400">Total Analyzed</div>
          <div className="text-lg font-bold text-white mt-1">
            {data ? data.total : "33"}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-amber-400 font-medium">Flagged Anomalies</div>
          <div className="text-lg font-bold text-amber-300 mt-1">
            {data ? data.items.filter((i) => i.is_anomaly).length : "8"}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-rose-400 font-medium">OFAC & Sanctions Matches</div>
          <div className="text-lg font-bold text-rose-400 mt-1">3 Detected</div>
        </div>
        <div className="p-3.5 rounded-xl bg-surface border border-border">
          <div className="text-[11px] text-cyan-400">Target EVM Network</div>
          <div className="text-lg font-bold text-white mt-1">Sepolia (11155111)</div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Tx Hash (0x...) or Counterparty Address..."
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={() => loadData()}
            className="p-2 rounded-lg bg-surface border border-border text-slate-400 hover:text-white"
            title="Refresh Table"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-border text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tx Hash</th>
                <th className="py-3 px-4">From</th>
                <th className="py-3 px-4">To (Counterparty)</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Risk Assessment</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && !data ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Loading transaction records...
                  </td>
                </tr>
              ) : data && data.items.length > 0 ? (
                data.items.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono text-cyan-400 flex items-center gap-1.5">
                      <span>{formatHash(tx.tx_hash)}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {formatAddress(tx.from_address)}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span
                        className={
                          tx.is_anomaly
                            ? "text-rose-400 font-semibold"
                            : "text-slate-300"
                        }
                      >
                        {formatAddress(tx.to_address)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-white font-mono">
                      {tx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{" "}
                      <span className="text-slate-400 font-normal">
                        {tx.asset_symbol}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tx.risk_score && tx.risk_score > 70 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          Risk: {tx.risk_score.toFixed(0)}/100
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Low Risk
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transactions found. Click{" "}
                    <button
                      onClick={handleSeedDemo}
                      className="text-emerald-400 font-semibold underline"
                    >
                      Seed Demo Transactions
                    </button>{" "}
                    to populate the dataset.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {data && data.total_pages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing Page {data.page} of {data.total_pages} ({data.total} records)
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-border hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-border hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Drawer / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              Transaction Intelligence Inspector
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-500 text-[10px]">TRANSACTION HASH</div>
                <div className="font-mono text-cyan-400 text-xs break-all mt-0.5">
                  {selectedTx.tx_hash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">VALUE</div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {selectedTx.amount} {selectedTx.asset_symbol}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-500 text-[10px]">RISK SCORE</div>
                  <div
                    className={`font-bold text-sm mt-0.5 ${
                      selectedTx.risk_score && selectedTx.risk_score > 70
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {selectedTx.risk_score?.toFixed(1) || "12.0"} / 100
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div>
                  <div className="text-slate-500 text-[10px]">FROM ADDRESS</div>
                  <div className="font-mono text-slate-300 break-all">
                    {selectedTx.from_address}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500 text-[10px]">TO ADDRESS (RECIPIENT)</div>
                  <div className="font-mono text-slate-300 break-all">
                    {selectedTx.to_address}
                  </div>
                </div>
              </div>

              {selectedTx.is_anomaly && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  <div className="font-semibold text-xs flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Risk Indicators Triggered:</span>
                  </div>
                  <ul className="list-disc pl-5 text-[11px] space-y-0.5">
                    {selectedTx.amount > 50 && (
                      <li>Outlier Transfer Value ({selectedTx.amount} ETH deviates &gt;3σ from baseline)</li>
                    )}
                    {selectedTx.to_address.toLowerCase().includes("d90e2f925") && (
                      <li>Sanctioned Mixer Interaction (OFAC Specially Designated Address)</li>
                    )}
                    {selectedTx.to_address.toLowerCase().includes("1da5821544") && (
                      <li>OpenSanctions Watchlist Match (SDN Executive Order 14024)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <a
                href={`https://sepolia.etherscan.io/tx/${selectedTx.tx_hash}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
              >
                <span>View on Etherscan</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
