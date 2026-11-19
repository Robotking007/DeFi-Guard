"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Activity, Bell, Wallet as WalletIcon, LogIn, LogOut, User, Sparkles } from "lucide-react";
import {
  fetchHealth,
  HealthResponse,
  fetchIntegrationsStatus,
  IntegrationsStatusData,
  getStoredToken,
  clearStoredToken,
} from "@/lib/api";

export function Navbar() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationsStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchHealth().catch(() => null),
      fetchIntegrationsStatus().catch(() => null),
    ]).then(([healthData, integrationsData]) => {
      if (healthData) setHealth(healthData);
      if (integrationsData) setIntegrations(integrationsData);
      setLoading(false);
    });

    if (typeof window !== "undefined") {
      setUserEmail(localStorage.getItem("defiguard_email"));
      setUserRole(localStorage.getItem("defiguard_role"));
    }
  }, []);

  const handleLogout = () => {
    clearStoredToken();
    setUserEmail(null);
    setUserRole(null);
    window.location.href = "/login";
  };

  return (
    <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-wide">
              DeFi<span className="text-emerald-400">Guard</span>
            </span>
            <span className="ml-2 text-xs text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.5">
              v1.0.0
            </span>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Google Gemini AI Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/40 text-[11px] text-purple-300">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          <Sparkles className="w-3 h-3 text-purple-400" />
          <span>Gemini AI: {integrations?.gemini.status === "online" ? "Active" : "Ready"}</span>
        </div>

        {/* Etherscan V2 Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Etherscan V2: Live</span>
        </div>

        {/* CoinGecko Live Price */}
        {integrations?.coingecko && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-mono">
            <span>ETH: ${integrations.coingecko.eth_usd.toLocaleString()}</span>
          </div>
        )}

        {/* Kaggle ML Model Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>ML: 10k Model</span>
        </div>

        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              loading
                ? "bg-amber-400 animate-pulse"
                : health?.database_connected
                ? "bg-emerald-400"
                : "bg-rose-400"
            }`}
          />
          <span className="text-slate-300">
            {loading
              ? "Connecting..."
              : health?.database_connected
              ? "FastAPI Online"
              : "API Offline"}
          </span>
        </div>

        {/* Network Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Sepolia (11155111)</span>
        </div>

        {/* User Session Profile / Login */}
        {userEmail ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-200">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white capitalize">{userRole}</span>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-slate-950 transition shadow-lg shadow-emerald-500/20"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
