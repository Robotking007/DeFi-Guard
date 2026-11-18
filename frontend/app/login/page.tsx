"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, UserCheck, ArrowRight, Sparkles } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("analyst@defiguard.io");
  const [password, setPassword] = useState<string>("Password123!");
  const [role, setRole] = useState<string>("analyst");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRegister) {
        await registerUser(email, password, role);
        setSuccess("Account registered successfully! Logging you in...");
        await loginUser(email, password);
      } else {
        await loginUser(email, password);
      }
      router.push("/transactions");
    } catch (err: any) {
      setError(err.message || "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  const setQuickDemo = async (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setRole(demoRole);
    setLoading(true);
    setError(null);

    try {
      // Attempt login, if not registered yet, auto-register then login
      try {
        await loginUser(demoEmail, "Password123!");
      } catch {
        await registerUser(demoEmail, "Password123!", demoRole);
        await loginUser(demoEmail, "Password123!");
      }
      router.push("/transactions");
    } catch (err: any) {
      setError(err.message || "Failed to initiate demo session.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center max-w-md mx-auto px-4 py-8">
      <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            {isRegister ? "Create DeFiGuard Account" : "Access DeFiGuard Platform"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safe sandbox with role-based governance & transaction intelligence
          </p>
        </div>

        {/* Quick Demo Shortcuts */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Logins</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setQuickDemo("analyst@defiguard.io", "analyst")}
              disabled={loading}
              className="py-1.5 px-2.5 rounded-lg bg-surface border border-slate-700/60 hover:border-emerald-500/50 text-[11px] font-medium text-slate-200 transition text-left"
            >
              🛡️ <span className="font-semibold text-white">Analyst</span>
              <div className="text-[9px] text-slate-400">AML & Risk Review</div>
            </button>
            <button
              type="button"
              onClick={() => setQuickDemo("trader@defiguard.io", "user")}
              disabled={loading}
              className="py-1.5 px-2.5 rounded-lg bg-surface border border-slate-700/60 hover:border-cyan-500/50 text-[11px] font-medium text-slate-200 transition text-left"
            >
              ⚡ <span className="font-semibold text-white">DeFi User</span>
              <div className="text-[9px] text-slate-400">Loans & AMM Swaps</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                placeholder="analyst@defiguard.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Access Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["user", "analyst", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                      role === r
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-950 border-border text-slate-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-slate-950 transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? (
              "Authenticating..."
            ) : (
              <>
                <span>{isRegister ? "Complete Registration" : "Sign In to Dashboard"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Need a new account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
