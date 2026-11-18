"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchComplianceMetrics,
  screenSanctionsTarget,
  fetchComplianceCases,
  updateComplianceCase,
  fileSARReport,
  verifyTravelRule,
  ComplianceMetrics,
  ComplianceCaseItem,
  ScreeningResponse,
  TravelRuleResult,
  getStoredToken,
} from "../../lib/api";

export default function CompliancePage() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [cases, setCases] = useState<ComplianceCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Sanctions screener state
  const [screenQuery, setScreenQuery] = useState("Tornado Cash");
  const [screenLoading, setScreenLoading] = useState(false);
  const [screenResult, setScreenResult] = useState<ScreeningResponse | null>(null);

  // Travel Rule state
  const [originatorName, setOriginatorName] = useState("Alice Nakamoto");
  const [originatorAddr, setOriginatorAddr] = useState("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  const [originatorVasp, setOriginatorVasp] = useState("Coinbase Institutional");
  const [beneficiaryName, setBeneficiaryName] = useState("Bob Szabo");
  const [beneficiaryAddr, setBeneficiaryAddr] = useState("0x742d35cc6634c0532925a3b844bc454e4438f44e");
  const [beneficiaryVasp, setBeneficiaryVasp] = useState("Kraken Prime");
  const [amountUsd, setAmountUsd] = useState(8500);
  const [travelRuleResult, setTravelRuleResult] = useState<TravelRuleResult | null>(null);
  const [travelRuleLoading, setTravelRuleLoading] = useState(false);

  // SAR Filing Modal state
  const [selectedCaseForSAR, setSelectedCaseForSAR] = useState<ComplianceCaseItem | null>(null);
  const [sarNarrative, setSarNarrative] = useState("");
  const [sarAmount, setSarAmount] = useState(50000);
  const [sarOfficer, setSarOfficer] = useState("Sarah Chen (Chief AML Officer)");
  const [sarReceipt, setSarReceipt] = useState<any | null>(null);
  const [sarLoading, setSarLoading] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [m, c] = await Promise.all([fetchComplianceMetrics(), fetchComplianceCases()]);
      setMetrics(m);
      setCases(c);
    } catch (err: any) {
      console.error(err);
      setFeedback("Failed to load compliance data. Ensure you are signed in.");
    } finally {
      setLoading(false);
    }
  }

  async function handleScreen() {
    if (!screenQuery.trim()) return;
    setScreenLoading(true);
    try {
      const res = await screenSanctionsTarget(screenQuery);
      setScreenResult(res);
    } catch (err: any) {
      alert("Screening failed: " + err.message);
    } finally {
      setScreenLoading(false);
    }
  }

  async function handleTravelRuleCheck(e: React.FormEvent) {
    e.preventDefault();
    setTravelRuleLoading(true);
    try {
      const res = await verifyTravelRule({
        originator_name: originatorName,
        originator_address: originatorAddr,
        originator_vasp: originatorVasp,
        beneficiary_name: beneficiaryName,
        beneficiary_address: beneficiaryAddr,
        beneficiary_vasp: beneficiaryVasp,
        amount_usd: Number(amountUsd),
      });
      setTravelRuleResult(res);
    } catch (err: any) {
      alert("Travel rule check error: " + err.message);
    } finally {
      setTravelRuleLoading(false);
    }
  }

  function openSARModal(c: ComplianceCaseItem) {
    setSelectedCaseForSAR(c);
    setSarReceipt(null);
    setSarNarrative(
      `Suspicious transaction activity detected involving entity ${c.entity_name || "Unknown"} (${c.target_address}). Evidence of ${c.violation_type} with calibrated risk score of ${c.risk_score}%. Immediate FinCEN BSA reporting and asset hold recommended pursuant to 31 CFR § 1020.320.`
    );
  }

  async function handleFileSAR() {
    if (!selectedCaseForSAR) return;
    setSarLoading(true);
    try {
      const res = await fileSARReport({
        case_id: selectedCaseForSAR.id,
        narrative: sarNarrative,
        suspicious_amount_usd: Number(sarAmount),
        officer_name: sarOfficer,
      });
      setSarReceipt(res);
      setFeedback(`SAR filed successfully: ${res.sar_reference}`);
      // Refresh case list
      const updatedCases = await fetchComplianceCases();
      setCases(updatedCases);
    } catch (err: any) {
      alert("SAR filing failed: " + err.message);
    } finally {
      setSarLoading(false);
    }
  }

  async function handleQuickStatusUpdate(caseId: string, newStatus: string) {
    try {
      await updateComplianceCase(caseId, { status: newStatus });
      setFeedback(`Case status updated to ${newStatus}`);
      const updatedCases = await fetchComplianceCases();
      setCases(updatedCases);
    } catch (err: any) {
      alert("Update failed: " + err.message);
    }
  }

  const filteredCases = cases.filter((c) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "OPEN") return c.status === "OPEN" || c.status === "INVESTIGATING";
    if (activeTab === "SAR_FILED") return c.decision === "sar_filed" || c.sar_reference;
    if (activeTab === "CLOSED") return c.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-8 bg-gradient-to-b from-rose-500 to-indigo-600 rounded-full inline-block"></span>
              Vesant.AI RegTech & Compliance Center
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Module 6
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time Anti-Money Laundering (AML) triage, OpenSanctions OFAC watchlist screening, and FATF Recommendation 16 Travel Rule compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2"></span>
            OpenSanctions 7.6MB CSV: Active
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            FinCEN BSA Gateway: Ready
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* KPI Metrics Cards (Vesant.AI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Overall Risk Score (88.46%) */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-rose-950/20 border border-rose-500/30 shadow-lg backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall AML Risk Score</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
              CRITICAL
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {metrics ? `${metrics.overall_risk_score}%` : "88.46%"}
            </div>
            <span className="text-xs text-rose-400 font-medium">↑ High Exposure</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "88.46%" }}></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Calibrated cross-cluster transaction threat level</p>
        </div>

        {/* Metric 2: Pending Alerts */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Alerts</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Needs Triage
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.pending_alerts : 14}
            </div>
            <span className="text-xs text-amber-400 font-medium">+3 today</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Anomalies awaiting compliance analyst review</p>
        </div>

        {/* Metric 3: Active Cases */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Cases</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
              Investigating
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.active_cases : 8}
            </div>
            <span className="text-xs text-indigo-400 font-medium">3 Critical, 5 High</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Escalated wallets under active investigative hold</p>
        </div>

        {/* Metric 4: Watchlist Matches */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Watchlist Matches</span>
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              OFAC SDN
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-extrabold text-white">
              {metrics ? metrics.watchlist_matches : 142}
            </div>
            <span className="text-xs text-emerald-400 font-medium">Indexed Live</span>
          </div>
          <p className="text-xs text-slate-400 mt-3">Sanctioned crypto addresses in local database</p>
        </div>
      </div>

      {/* Middle Grid: OpenSanctions Interactive Screener + FATF Travel Rule Checker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OpenSanctions Interactive Screener */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                OpenSanctions Live Target Screener
              </h2>
              <p className="text-xs text-slate-400">
                Instantly check addresses and entity names against 7.6MB OFAC, UN, and EU sanction records.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={screenQuery}
                onChange={(e) => setScreenQuery(e.target.value)}
                placeholder="Enter address (0x...) or sanctioned entity name"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleScreen}
                disabled={screenLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-rose-600/20"
              >
                {screenLoading ? "Screening..." : "Screen Target"}
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Quick tests:</span>
              {[
                { label: "Tornado Cash", q: "Tornado Cash" },
                { label: "Garantex", q: "Garantex" },
                { label: "Lazarus", q: "Lazarus" },
                { label: "Tornado Router", q: "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b" },
                { label: "Clean Wallet", q: "0x1111111111111111111111111111111111111111" },
              ].map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    setScreenQuery(chip.q);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Screening Output */}
          {screenResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Target: {screenResult.query}</span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    screenResult.is_sanctioned
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  }`}
                >
                  {screenResult.is_sanctioned ? "🚨 SANCTIONED / WATCHLIST HIT" : "✓ CLEAN (NO HITS)"}
                </span>
              </div>

              {screenResult.matches.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {screenResult.matches.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{m.name || "Target Match"}</span>
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 text-[10px] uppercase font-bold">
                          {m.severity}
                        </span>
                      </div>
                      {m.sanctions && <p className="text-slate-300">Sanction: <span className="text-rose-400">{m.sanctions}</span></p>}
                      {m.dataset && <p className="text-slate-400">Dataset: {m.dataset}</p>}
                      {m.program_ids && <p className="text-slate-400">Program: {m.program_ids}</p>}
                      {m.countries && <p className="text-slate-400">Jurisdiction: {m.countries}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No matching entries found across the current OpenSanctions SDN and terror financing indices.
                </p>
              )}
            </div>
          )}
        </div>

        {/* FATF Travel Rule Compliance Checker */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                FATF Recommendation 16 (Travel Rule)
              </h2>
              <p className="text-xs text-slate-400">
                Validate cryptographic transmission data for transactions exceeding the $1,000 reporting threshold.
              </p>
            </div>
          </div>

          <form onSubmit={handleTravelRuleCheck} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Originator Name</label>
                <input
                  type="text"
                  value={originatorName}
                  onChange={(e) => setOriginatorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Originator VASP</label>
                <input
                  type="text"
                  value={originatorVasp}
                  onChange={(e) => setOriginatorVasp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Beneficiary Name</label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Beneficiary VASP</label>
                <input
                  type="text"
                  value={beneficiaryVasp}
                  onChange={(e) => setBeneficiaryVasp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase">Transfer Amount (USD)</label>
                <input
                  type="number"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={travelRuleLoading}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition"
                >
                  {travelRuleLoading ? "Validating..." : "Verify Travel Rule"}
                </button>
              </div>
            </div>
          </form>

          {travelRuleResult && (
            <div
              className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                travelRuleResult.is_compliant
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                  : "bg-rose-950/30 border-rose-500/40 text-rose-200"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>Verdict: {travelRuleResult.risk_verdict}</span>
                <span>Threshold ($1,000): {travelRuleResult.threshold_exceeded ? "Exceeded" : "Below"}</span>
              </div>
              <p className="text-slate-300">{travelRuleResult.recommendation}</p>
              {travelRuleResult.missing_fields.length > 0 && (
                <p className="text-amber-400 font-medium">
                  Missing required PII: {travelRuleResult.missing_fields.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Compliance Case Management & FinCEN SAR Filing (Vesant.AI Table) */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Compliance Case Triage & Regulatory SAR Management
            </h2>
            <p className="text-xs text-slate-400">
              Assigned investigative cases, regulatory SAR filing tracking, and enforcement logs.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
            {["ALL", "OPEN", "SAR_FILED", "CLOSED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Cases Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Case ID</th>
                <th className="py-3 px-3">Target Entity / Address</th>
                <th className="py-3 px-3">Violation / Trigger</th>
                <th className="py-3 px-3">Risk Score</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Assigned Officer</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-3 font-mono font-medium text-slate-300">
                    {c.case_number}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{c.entity_name || "Unknown Counterparty"}</div>
                    <div className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]" title={c.target_address}>
                      {c.target_address}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                      {c.violation_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold">
                    <span
                      className={
                        c.risk_score >= 80
                          ? "text-rose-400"
                          : c.risk_score >= 50
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }
                    >
                      {c.risk_score.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        c.priority === "CRITICAL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : c.priority === "HIGH"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                          : c.priority === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        c.decision === "sar_filed" || c.sar_reference
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                          : c.status === "CLOSED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : c.status === "INVESTIGATING" || c.status === "ESCALATED"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      }`}
                    >
                      {c.sar_reference ? "SAR FILED" : c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {c.assigned_to || "Unassigned"}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {c.status !== "CLOSED" && !c.sar_reference && (
                        <button
                          onClick={() => openSARModal(c)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-[11px] transition shadow-sm"
                        >
                          File SAR
                        </button>
                      )}
                      {c.status !== "CLOSED" && (
                        <button
                          onClick={() => handleQuickStatusUpdate(c.id, "CLOSED")}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium text-[11px] border border-slate-700 transition"
                        >
                          Close
                        </button>
                      )}
                      {c.sar_reference && (
                        <span className="font-mono text-[10px] text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                          {c.sar_reference}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SAR Filing Modal */}
      {selectedCaseForSAR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                  FinCEN Suspicious Activity Report (SAR) Filing
                </h3>
                <p className="text-xs text-slate-400">
                  Case {selectedCaseForSAR.case_number} • Target: {selectedCaseForSAR.target_address}
                </p>
              </div>
              <button
                onClick={() => setSelectedCaseForSAR(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {sarReceipt ? (
              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 space-y-2 text-xs">
                <div className="font-bold text-sm text-purple-300">✓ SAR Transmitted to Regulatory Gateway</div>
                <p>Reference Code: <span className="font-mono font-bold text-white">{sarReceipt.sar_reference}</span></p>
                <p>Status: <span className="text-emerald-400 font-semibold">{sarReceipt.status}</span></p>
                <p>Timestamp: {sarReceipt.filed_at}</p>
                <p>Endpoint: <span className="font-mono text-slate-400">{sarReceipt.regulatory_endpoint}</span></p>
                <div className="pt-2">
                  <button
                    onClick={() => setSelectedCaseForSAR(null)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 uppercase">Suspicious Amount (USD)</label>
                    <input
                      type="number"
                      value={sarAmount}
                      onChange={(e) => setSarAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 uppercase">Filing Compliance Officer</label>
                    <input
                      type="text"
                      value={sarOfficer}
                      onChange={(e) => setSarOfficer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase">Investigative Narrative (Required)</label>
                  <textarea
                    rows={4}
                    value={sarNarrative}
                    onChange={(e) => setSarNarrative(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCaseForSAR(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleFileSAR}
                    disabled={sarLoading || sarNarrative.length < 20}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-lg shadow-rose-600/20"
                  >
                    {sarLoading ? "Submitting to FinCEN..." : "Submit Official SAR Filing"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
