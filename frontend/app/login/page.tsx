"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Wallet as WalletIcon,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  loginUser,
  registerUser,
  getSiweNonce,
  verifySiwe,
  loginWeb3Auth,
} from "@/lib/api";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("analyst@defiguard.io");
  const [password, setPassword] = useState<string>("Password123!");
  const [role, setRole] = useState<string>("analyst");
  const [loading, setLoading] = useState<boolean>(false);
  const [web3Loading, setWeb3Loading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Web3 Sign-In with Ethereum (MetaMask SIWE - EIP-4361)
  const handleMetaMaskSignIn = async () => {
    setWeb3Loading(true);
    setError(null);
    setSuccess(null);

    try {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error(
          "MetaMask wallet extension not detected. Please install MetaMask or use Web3Auth below."
        );
      }

      // 1. Request account from MetaMask
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts || accounts.length === 0) {
        throw new Error("No Ethereum account selected in MetaMask.");
      }
      const address = accounts[0];

      // 2. Request challenge nonce from backend
      const nonce = await getSiweNonce();

      // 3. Construct EIP-4361 compliant challenge message
      const domain = window.location.host;
      const uri = window.location.origin;
      const message =
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${address}\n\n` +
        `Sign in to DeFiGuard Risk Assessment & Compliance Platform.\n\n` +
        `URI: ${uri}\n` +
        `Version: 1\n` +
        `Chain ID: 11155111\n` +
        `Nonce: ${nonce}\n` +
        `Issued At: ${new Date().toISOString()}`;

      // 4. Request cryptographic signature from MetaMask
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      // 5. Verify signature with DeFiGuard backend
      await verifySiwe(address, message, signature);
      setSuccess("Wallet cryptographically verified! Redirecting...");
      router.push("/transactions");
    } catch (err: any) {
      console.error("SIWE error:", err);
      setError(err.message || "Failed to sign in with Ethereum wallet.");
    } finally {
      setWeb3Loading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isRegister) {
        await registerUser(email, password, role);
        setSuccess("Account registered! Logging in...");
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

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center max-w-md mx-auto px-4 py-8">
      <div className="w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">
            DeFiGuard Authentication
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in with MetaMask (EIP-4361 SIWE) or Web3Auth Sapphire Devnet
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* PRIMARY WEB3 WALLET LOGIN (SIWE) */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleMetaMaskSignIn}
            disabled={web3Loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <WalletIcon className="w-4 h-4 text-slate-950" />
            <span>
              {web3Loading
                ? "Waiting for MetaMask Signature..."
                : "Sign-In with Ethereum (MetaMask)"}
            </span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Network: Sepolia (11155111)</span>
            <span>Zero Gas Fee Required</span>
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-3 text-slate-500 text-[10px] uppercase tracking-wider">
            Or standard credentials
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* EMAIL & PASSWORD LOGIN FORM */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                className="w-full bg-slate-950 border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-slate-950 border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Role
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
            className="w-full py-2.5 rounded-lg bg-surface border border-slate-700 hover:border-slate-500 font-semibold text-xs text-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : isRegister ? "Create Account" : "Sign In"}
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
