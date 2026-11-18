"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchContractPresets,
  runContractScan,
  explainFindingWithGemini,
  PresetContract,
  SecurityScanResponse,
} from "../../lib/api";

export default function SecurityPage() {
  const [presets, setPresets] = useState<PresetContract[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("reentrancy_vault");
  const [contractName, setContractName] = useState<string>("VulnerableReentrancyVault.sol");
  const [sourceCode, setSourceCode] = useState<string>("");
  const [compilerVersion, setCompilerVersion] = useState<string>("0.8.24");

  const [scanResult, setScanResult] = useState<SecurityScanResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Google Gemini AI Explanation State
  const [geminiExplanation, setGeminiExplanation] = useState<string | null>(null);
  const [explainingDetector, setExplainingDetector] = useState<string | null>(null);
  const [geminiLoading, setGeminiLoading] = useState<boolean>(false);

  async function handleGeminiExplain(detector: string, snippet: string) {
    setGeminiLoading(true);
    setExplainingDetector(detector);
    setGeminiExplanation(null);
    try {
      const res = await explainFindingWithGemini(detector, snippet);
      setGeminiExplanation(res.explanation);
    } catch (err: any) {
      setGeminiExplanation("Failed to generate Gemini AI explanation: " + err.message);
    } finally {
      setGeminiLoading(false);
    }
  }

  useEffect(() => {
    fetchContractPresets()
      .then((data) => {
        setPresets(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedPresetId(first.id);
          setContractName(first.name);
          setSourceCode(first.code);
          // Run initial scan on first preset
          handleRunScan(first.name, first.code);
        }
      })
      .catch((err) => console.warn("Failed to load presets:", err));
  }, []);

  function handleSelectPreset(preset: PresetContract) {
    setSelectedPresetId(preset.id);
    setContractName(preset.name);
    setSourceCode(preset.code);
    handleRunScan(preset.name, preset.code);
  }

  async function handleRunScan(cName?: string, cCode?: string) {
    const nameToScan = cName || contractName;
    const codeToScan = cCode || sourceCode;

    if (!codeToScan.trim()) {
      setErrorMsg("Please provide Solidity source code to audit.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await runContractScan({
        contract_name: nameToScan,
        source_code: codeToScan,
        compiler_version: compilerVersion,
      });
      setScanResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to run security scan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-8 bg-gradient-to-b from-amber-500 to-rose-600 rounded-full inline-block"></span>
              Smart Contract Security Auditor
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Module 7
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Automated AST static analysis, reentrancy detection, and economic exploit prevention powered by Slither 0.11.6 and Solidity 0.8.24.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-2"></span>
            Slither AST 0.11.6: Active
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            solc 0.8.24: Ready
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Preset Selector Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-white">Educational Vulnerability Presets (1-Click Audit):</span>
          <span>Click a preset to inspect vulnerability vectors</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPreset(p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 ${
                selectedPresetId === p.id
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  p.id.includes("reentrancy")
                    ? "bg-rose-500"
                    : p.id.includes("oracle")
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              ></span>
              <span className="font-mono font-semibold">{p.name}</span>
              <span className="text-[10px] text-slate-500">({p.category})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Split: Code Editor & Audit Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Solidity Editor (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                className="bg-transparent text-sm font-bold text-white font-mono focus:outline-none focus:border-b border-indigo-500"
                placeholder="ContractName.sol"
              />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Solidity Compiler:</span>
              <select
                value={compilerVersion}
                onChange={(e) => setCompilerVersion(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="0.8.24">0.8.24 (Current)</option>
                <option value="0.8.20">0.8.20</option>
                <option value="0.8.0">0.8.0</option>
              </select>
            </div>
          </div>

          {/* Code Textarea */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
            <textarea
              rows={18}
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value);
                setSelectedPresetId("custom");
              }}
              spellCheck={false}
              className="w-full p-4 bg-transparent font-mono text-xs text-slate-200 focus:outline-none resize-y leading-relaxed"
              placeholder="// Paste Solidity code here..."
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-500">
              {sourceCode.split("\n").length} lines • {sourceCode.length} characters
            </span>
            <button
              onClick={() => handleRunScan()}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-amber-600/20"
            >
              {loading ? "Running Slither Static Scan..." : "Run Slither Security Audit"}
            </button>
          </div>
        </div>

        {/* Right Column: Audit Scorecard & Findings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {scanResult && (
            <>
              {/* Scorecard Widget */}
              <div
                className={`p-6 rounded-2xl border shadow-xl backdrop-blur-md space-y-4 ${
                  scanResult.is_safe_to_deploy
                    ? "bg-gradient-to-br from-slate-900/90 to-emerald-950/20 border-emerald-500/30"
                    : "bg-gradient-to-br from-slate-900/90 to-rose-950/30 border-rose-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Security Scorecard
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                      scanResult.is_safe_to_deploy
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                    }`}
                  >
                    Grade {scanResult.score_grade}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-extrabold text-white font-mono">
                    {scanResult.security_score}
                    <span className="text-lg text-slate-500 font-normal">/100</span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      scanResult.is_safe_to_deploy ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {scanResult.is_safe_to_deploy ? "✓ Safe to Deploy" : "🚨 Unsafe for Mainnet"}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${
                      scanResult.security_score >= 80
                        ? "bg-emerald-500"
                        : scanResult.security_score >= 50
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${scanResult.security_score}%` }}
                  ></div>
                </div>

                <p className="text-xs text-slate-300">{scanResult.summary}</p>

                {/* Findings Count Badges */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center">
                  <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/30">
                    <div className="text-sm font-bold text-rose-300 font-mono">
                      {scanResult.findings_count.high}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">High</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/40 border border-amber-500/30">
                    <div className="text-sm font-bold text-amber-300 font-mono">
                      {scanResult.findings_count.medium}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Medium</div>
                  </div>
                  <div className="p-2 rounded-lg bg-yellow-950/30 border border-yellow-500/30">
                    <div className="text-sm font-bold text-yellow-300 font-mono">
                      {scanResult.findings_count.low}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Low</div>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-500/30">
                    <div className="text-sm font-bold text-blue-300 font-mono">
                      {scanResult.findings_count.informational}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase">Info</div>
                  </div>
                </div>
              </div>

              {/* Detector Findings List */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Detected Vulnerabilities ({scanResult.findings.length})
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">{scanResult.scan_id}</span>
                </div>

                {scanResult.findings.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 text-center text-xs text-emerald-400 border border-slate-800">
                    ✓ Clean audit! No vulnerabilities detected by Slither AST detectors.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {scanResult.findings.map((f, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                          f.severity === "high"
                            ? "bg-rose-950/30 border-rose-500/40"
                            : f.severity === "medium"
                            ? "bg-amber-950/30 border-amber-500/40"
                            : "bg-slate-950 border-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-white flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                f.severity === "high"
                                  ? "bg-rose-500"
                                  : f.severity === "medium"
                                  ? "bg-amber-500"
                                  : "bg-blue-400"
                              }`}
                            ></span>
                            {f.detector}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                              f.severity === "high"
                                ? "bg-rose-500/20 text-rose-300"
                                : f.severity === "medium"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {f.severity}
                          </span>
                        </div>
                        {f.line_number && (
                          <div className="font-mono text-[11px] text-slate-400">
                            Location: Line {f.line_number}
                          </div>
                        )}
                        <p className="text-slate-300 text-[11px]">{f.description}</p>
                        {f.recommendation && (
                          <div className="p-2 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-emerald-300 mt-1">
                            <span className="font-semibold text-slate-400">Remediation:</span> {f.recommendation}
                          </div>
                        )}

                        {/* Gemini Generative AI Explanation Trigger */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleGeminiExplain(f.detector, f.recommendation || f.description)}
                            disabled={geminiLoading && explainingDetector === f.detector}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-[11px] font-semibold text-purple-300 transition disabled:opacity-50"
                          >
                            <span>✨</span>
                            <span>
                              {geminiLoading && explainingDetector === f.detector
                                ? "Consulting Gemini AI..."
                                : "Analyze with Google Gemini AI"}
                            </span>
                          </button>
                        </div>

                        {geminiExplanation && explainingDetector === f.detector && (
                          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 mt-2 space-y-1.5 whitespace-pre-line">
                            <div className="flex items-center justify-between font-bold text-purple-300 text-[11px] uppercase tracking-wide border-b border-purple-500/20 pb-1">
                              <span>Google Gemini Flash Remediation Intelligence</span>
                              <button
                                onClick={() => setGeminiExplanation(null)}
                                className="text-slate-400 hover:text-white"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-200 leading-relaxed font-sans">
                              {geminiExplanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
