"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Repeat,
  Code2,
  BrainCircuit,
  FileCheck2,
  ShieldAlert,
  LineChart,
  Vote,
  Globe2,
  Settings,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  module: string;
}

const navItems: NavItem[] = [
  { name: "Overview", href: "/", icon: LayoutDashboard, module: "M1" },
  { name: "Transactions", href: "/transactions", icon: Repeat, badge: "Live", module: "M1" },
  { name: "Lending & Borrow", href: "/lending", icon: Layers, module: "M2" },
  { name: "Token Swaps (AMM)", href: "/swap", icon: Repeat, module: "M3" },
  { name: "Smart Contracts", href: "/contracts", icon: Code2, module: "M4" },
  { name: "AI Risk Engine", href: "/risk-center", icon: BrainCircuit, badge: "AI", module: "M5" },
  { name: "RegTech & Compliance", href: "/compliance", icon: FileCheck2, badge: "AML", module: "M6" },
  { name: "Security Auditor", href: "/security", icon: ShieldAlert, module: "M7" },
  { name: "Financial Risk & VaR", href: "/analytics", icon: LineChart, module: "M8" },
  { name: "DAO Governance", href: "/governance", icon: Vote, module: "M9" },
  { name: "FinTech & Society", href: "/impact", icon: Globe2, module: "M10" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col justify-between p-4 shrink-0 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-3 mb-2">
            DeFi & Risk Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.module}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
          <div className="text-slate-300 font-medium">Safe Test Environment</div>
          <div>No real funds. Synthetic data & testnet simulator active.</div>
        </div>
      </div>
    </aside>
  );
}
