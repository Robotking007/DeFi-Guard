"use client";

import React, { useState } from "react";
import { Sparkles, MessageSquare, Send, X, Bot, Shield, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { askGeminiAi } from "@/lib/api";

interface ChatMessage {
  sender: "user" | "gemini";
  text: string;
  timestamp: string;
}

export function GeminiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "gemini",
      text: "Hello! I am your Google Gemini Flash AI audit assistant. Ask me anything about smart contract vulnerabilities, DeFi risk metrics, or regulatory compliance.",
      timestamp: "Just now",
    },
  ]);

  const QUICK_PROMPTS = [
    "Explain reentrancy exploit with Solidity 0.8.24 remediation",
    "How does the constant product AMM invariant work?",
    "Explain FATF Travel Rule threshold for crypto transfers",
    "How does Isolation Forest detect transaction anomalies?",
  ];

  const handleSend = async (promptToSend?: string) => {
    const prompt = (promptToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!promptToSend) setInputPrompt("");
    setLoading(true);

    try {
      const res = await askGeminiAi(prompt);
      const aiMsg: ChatMessage = {
        sender: "gemini",
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "gemini",
          text: "Error querying Gemini API: " + (err.message || "Failed to reach AI service."),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Floating Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs shadow-2xl shadow-purple-500/40 border border-purple-400/30 transition transform hover:scale-105"
        >
          <Sparkles className="w-4 h-4 animate-spin text-purple-200" style={{ animationDuration: "4s" }} />
          <span>Ask Google Gemini AI</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      ) : (
        /* Expanded Floating Chat Panel */
        <div className="w-[380px] sm:w-[440px] h-[520px] rounded-2xl bg-slate-950/95 border border-purple-500/40 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-purple-900/60 via-slate-900 to-slate-900 border-b border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Google Gemini 2.0 Flash</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">GCP Project: 507081010383</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2.5 bg-slate-900/50 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-[10px] text-purple-300 transition shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm font-sans"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-purple-500/20 text-purple-300 text-xs w-fit">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini Flash is generating response...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask Gemini about DeFi risk, contracts, or SAR..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={loading || !inputPrompt.trim()}
                className="p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg disabled:opacity-50 transition"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
