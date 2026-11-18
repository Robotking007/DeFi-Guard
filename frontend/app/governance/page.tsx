"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchProposals,
  createDAOProposal,
  castVoteOnProposal,
  executeDAOProposal,
  ProposalItem,
  getStoredToken,
} from "../../lib/api";

export default function GovernancePage() {
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [votingModalProp, setVotingModalProp] = useState<ProposalItem | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [proposerWallet, setProposerWallet] = useState("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
  const [durationDays, setDurationDays] = useState(3);
  const [createLoading, setCreateLoading] = useState(false);

  // Voting form state
  const [voterWallet, setVoterWallet] = useState("0x742d35cc6634c0532925a3b844bc454e4438f44e");
  const [votingPower, setVotingPower] = useState(2500);
  const [voteLoading, setVoteLoading] = useState(false);

  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  async function loadProposals() {
    setLoading(true);
    try {
      const data = await fetchProposals();
      setProposals(data);
    } catch (e: any) {
      console.warn("Failed to load proposals:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setCreateLoading(true);
    try {
      await createDAOProposal({
        title: newTitle,
        description: newDesc,
        proposer_wallet: proposerWallet,
        duration_days: durationDays,
      });
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      setFeedback("DAO Proposal created successfully on-chain!");
      loadProposals();
    } catch (err: any) {
      alert("Proposal creation failed: " + err.message);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleCastVote(choice: "for" | "against" | "abstain") {
    if (!votingModalProp) return;
    setVoteLoading(true);
    try {
      await castVoteOnProposal({
        proposal_id: votingModalProp.id,
        voter_wallet: voterWallet,
        choice,
        voting_power: Number(votingPower),
      });
      setVotingModalProp(null);
      setFeedback(`Vote '${choice.toUpperCase()}' cast with ${votingPower} DGUARD tokens!`);
      loadProposals();
    } catch (err: any) {
      alert("Vote failed: " + err.message);
    } finally {
      setVoteLoading(false);
    }
  }

  async function handleExecute(propId: string) {
    try {
      const res = await executeDAOProposal(propId);
      setFeedback(`Proposal executed on-chain! Tx: ${res.tx_hash}`);
      loadProposals();
    } catch (err: any) {
      alert("Execution failed: " + err.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-3 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full inline-block"></span>
              DAO Governance & Voting Engine
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Module 9
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Democratic proposal lifecycle, token-weighted voting with quorum validation, and timelocked execution for DeFi parameter governance.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-purple-600/20"
        >
          + Create Proposal
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-5">
        {proposals.map((p) => {
          const total = p.total_votes || 1;
          const forPct = ((p.votes_for / total) * 100).toFixed(1);
          const againstPct = ((p.votes_against / total) * 100).toFixed(1);
          const abstainPct = ((p.votes_abstain / total) * 100).toFixed(1);

          return (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : p.status === "PASSED"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : p.status === "EXECUTED"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Proposer: {p.proposer_wallet.slice(0, 8)}...{p.proposer_wallet.slice(-6)}
                    </span>
                    <span className="text-xs text-indigo-400 font-medium">• {p.time_remaining}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{p.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {p.status === "ACTIVE" && (
                    <button
                      onClick={() => setVotingModalProp(p)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition shadow-md"
                    >
                      Cast Vote
                    </button>
                  )}
                  {p.status === "PASSED" && (
                    <button
                      onClick={() => handleExecute(p.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-md"
                    >
                      Execute Proposal
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

              {/* Voting Progress Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span className="text-emerald-400 font-semibold">For: {p.votes_for.toLocaleString()} ({forPct}%)</span>
                  <span className="text-rose-400 font-semibold">Against: {p.votes_against.toLocaleString()} ({againstPct}%)</span>
                  <span className="text-slate-400">Abstain: {p.votes_abstain.toLocaleString()} ({abstainPct}%)</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-950 rounded-full flex overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full" style={{ width: `${forPct}%` }}></div>
                  <div className="bg-rose-500 h-full" style={{ width: `${againstPct}%` }}></div>
                  <div className="bg-slate-600 h-full" style={{ width: `${abstainPct}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    Quorum Status:{" "}
                    <span className={p.quorum_reached ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                      {p.total_votes.toLocaleString()} / {p.quorum_threshold.toLocaleString()} DGUARD (
                      {p.quorum_reached ? "Reached" : "Pending"})
                    </span>
                  </span>
                  <span>Voting Closes: {p.end_at.slice(0, 10)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cast Vote Modal */}
      {votingModalProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Cast Your DAO Vote</h3>
              <button onClick={() => setVotingModalProp(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-medium">{votingModalProp.title}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Voter Wallet Address</label>
                <input
                  type="text"
                  value={voterWallet}
                  onChange={(e) => setVoterWallet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Voting Power (DGUARD Tokens)</label>
                <input
                  type="number"
                  value={votingPower}
                  onChange={(e) => setVotingPower(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={voteLoading}
                  onClick={() => handleCastVote("for")}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  Vote FOR
                </button>
                <button
                  type="button"
                  disabled={voteLoading}
                  onClick={() => handleCastVote("against")}
                  className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition shadow-md shadow-rose-600/20"
                >
                  AGAINST
                </button>
                <button
                  type="button"
                  disabled={voteLoading}
                  onClick={() => handleCastVote("abstain")}
                  className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition border border-slate-700"
                >
                  Abstain
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create New Governance Proposal</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Proposal Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. DIP-17: Adjust Lending Utilization Kink Point"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Proposer Wallet Address</label>
                <input
                  type="text"
                  required
                  value={proposerWallet}
                  onChange={(e) => setProposerWallet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Voting Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Detailed Proposal Description</label>
                <textarea
                  rows={4}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain motivation, mathematical changes, and protocol security implications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg shadow-purple-600/20"
                >
                  {createLoading ? "Submitting on-chain..." : "Submit Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
