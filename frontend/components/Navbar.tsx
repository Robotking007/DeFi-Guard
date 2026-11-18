"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Activity, Bell, Wallet as WalletIcon, LogIn, LogOut, User } from "lucide-react";
import { fetchHealth, HealthResponse, getStoredToken, clearStoredToken } from "@/lib/api";

export function Navbar() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend not reachable yet:", err);
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

      <div className="flex items-center gap-3">
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
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Sepolia (11155111)</span>
        </div>

        {/* Demo Wallet Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-200">
          <WalletIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>0x71C8...B01E</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-semibold text-slate-950 transition"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
