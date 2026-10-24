"use client";
import { useState } from "react";
import { PORTFOLIO_COMPANIES, STARTUPS } from "@/src/lib/mockData";
import { useStore } from "@/src/store/useStore";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, AreaChart, Area
} from "recharts";
import Link from "next/link";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

const MILESTONES = [
  { company: "NeuroPay",   milestone: "Raised $320K committed in session", date: "Oct 20" },
  { company: "FluxCore",   milestone: "Series A term sheet signed",         date: "Oct 18" },
  { company: "Cognify",    milestone: "Deal closed — full ask met",          date: "Oct 15" },
  { company: "GreenStack", milestone: "3 new enterprise pilots secured",     date: "Oct 12" },
];

export function PortfolioDashboard() {
  const { setTermSheetOpen } = useStore();
  const [activeTab, setActiveTab] = useState<"portfolio" | "viewer" | "termsheet">("portfolio");

  const totalInvested = PORTFOLIO_COMPANIES.reduce((s, c) => s + c.invested, 0);
  const totalCurrentVal = PORTFOLIO_COMPANIES.reduce((s, c) => s + c.currentVal, 0);
  const totalReturn = ((totalCurrentVal - totalInvested) / totalInvested) * 100;

  const pieData = PORTFOLIO_COMPANIES.map(c => ({ name: c.name, value: c.invested, color: c.color }));

  const barData = PORTFOLIO_COMPANIES.map(c => ({
    name: c.name,
    invested: c.invested,
    current: c.currentVal,
    color: c.color,
  }));

  return (
    <div className="flex flex-col h-full overflow-y-auto p-8 gap-8">
      {/* Header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">Module 4 · Investor</p>
        <h1 className="text-2xl font-light text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>
          Portfolio & Deal Room
        </h1>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Deployed", value: fmt(totalInvested), color: "#8338ec" },
          { label: "Current Value",  value: fmt(totalCurrentVal), color: "#06d6a0" },
          { label: "Total Return",   value: `+${totalReturn.toFixed(1)}%`, color: "#ffbe0b" },
          { label: "Companies",      value: String(PORTFOLIO_COMPANIES.length), color: "#3a86ff" },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-5 border border-white/8"
            style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[9px] uppercase tracking-widest text-white/30 mb-2">{k.label}</p>
            <p className="text-2xl font-mono" style={{ color: k.color, fontFamily: "'Orbitron',sans-serif", fontSize: "1.3rem" }}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-white/8 w-fit"
        style={{ background: "rgba(255,255,255,0.02)" }}>
        {(["portfolio", "viewer", "termsheet"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-xs capitalize transition-all"
            style={{
              background: activeTab === t ? "rgba(131,56,236,0.2)" : "transparent",
              color: activeTab === t ? "#c4b5fd" : "rgba(255,255,255,0.35)",
              border: activeTab === t ? "1px solid rgba(131,56,236,0.35)" : "1px solid transparent",
            }}>
            {t === "portfolio" ? "Portfolio Tracking" :
             t === "viewer" ? "Secure Doc Viewer" : "Term Sheet Generator"}
          </button>
        ))}
      </div>

      {/* Tab: Portfolio Tracking */}
      {activeTab === "portfolio" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie chart */}
            <div className="rounded-xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-4">Capital Allocation</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "#fff" }}
                    formatter={(v: any) => [fmt(Number(v) || 0), "Invested"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-white/45">
                    <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Bar chart */}
            <div className="rounded-xl p-5 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[9px] uppercase tracking-widest text-white/30 mb-4">Invested vs Current Value</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}K`} />
                  <Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: "#fff" }}
                    formatter={(v: any) => [fmt(Number(v) || 0)]} />
                  <Bar dataKey="invested" fill="rgba(131,56,236,0.5)" radius={[4,4,0,0]} />
                  <Bar dataKey="current" fill="rgba(6,214,160,0.5)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Company rows */}
          <div className="flex flex-col gap-2">
            {PORTFOLIO_COMPANIES.map(c => (
              <div key={c.id}
                className="flex items-center gap-5 rounded-xl px-5 py-4 border border-white/8 hover:border-white/15 transition-colors group"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${c.color}33`, color: c.color }}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-[10px] text-white/35">{c.industry} · {c.stage}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Invested</p>
                  <p className="text-sm font-mono text-white/70">{fmt(c.invested)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Current</p>
                  <p className="text-sm font-mono" style={{ color: c.color }}>{fmt(c.currentVal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Equity</p>
                  <p className="text-sm font-mono text-white/60">{c.equity}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Return</p>
                  <p className="text-sm font-mono text-green-400">
                    +{(((c.currentVal - c.invested) / c.invested) * 100).toFixed(0)}%
                  </p>
                </div>
                <button onClick={() => setTermSheetOpen(c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-3 py-1.5 rounded-lg border"
                  style={{ border: "1px solid rgba(131,56,236,0.4)", color: "#c4b5fd" }}>
                  Term Sheet
                </button>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div>
            <p className="text-[9px] uppercase tracking-widest text-white/25 mb-4">Growth Milestones</p>
            <div className="flex flex-col gap-2">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl px-5 py-3 border border-white/6"
                  style={{ background: "rgba(255,255,255,0.01)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-white/70 mr-2">{m.company}</span>
                    <span className="text-xs text-white/40">{m.milestone}</span>
                  </div>
                  <span className="text-[10px] text-white/25 font-mono shrink-0">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Secure Doc Viewer */}
      {activeTab === "viewer" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-white/40 mb-2">Restricted access to confidential founder documents. Watermarked for audit trail.</p>
          {[
            { company: "NeuroPay",   docs: ["Q3 Financial Audit 2025.pdf", "NeuroPay PitchDeck v3.pdf", "Cap Table Oct 2025.xlsx"] },
            { company: "FluxCore",   docs: ["Series A Financials.pdf", "FluxCore Deck Final.pdf"] },
            { company: "Cognify",    docs: ["Cognify Revenue Model.xlsx"] },
          ].map(row => (
            <div key={row.company} className="rounded-xl p-5 border border-white/8"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-sm font-medium text-white mb-3">{row.company}</p>
              <div className="flex flex-col gap-2">
                {row.docs.map(doc => (
                  <div key={doc} className="flex items-center justify-between px-4 py-3 rounded-lg border border-white/6 group hover:border-white/12 transition-colors"
                    style={{ background: "rgba(255,255,255,0.01)" }}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{doc.endsWith(".pdf") ? "📄" : "📊"}</span>
                      <span className="text-xs text-white/60">{doc}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] px-2 py-1 rounded text-green-400 bg-green-400/10">Verified</span>
                      <button className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                        🔒 View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Term Sheet Generator */}
      {activeTab === "termsheet" && <TermSheetGenerator />}
    </div>
  );
}

// ── Term Sheet Generator ────────────────────────────────────────────────────
function TermSheetGenerator() {
  const [company, setCompany] = useState("NeuroPay");
  const [amount, setAmount] = useState("150000");
  const [equity, setEquity] = useState("2.4");
  const [valuation, setValuation] = useState("6250000");
  const [instrument, setInstrument] = useState("SAFE");
  const [generated, setGenerated] = useState(false);

  const generate = () => setGenerated(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="rounded-xl p-6 border border-white/8" style={{ background: "rgba(255,255,255,0.02)" }}>
        <p className="text-sm font-medium text-white mb-5">Configure Term Sheet</p>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/45">Company</span>
            <select value={company} onChange={e => setCompany(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}>
              {PORTFOLIO_COMPANIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/45">Investment ($)</span>
              <input value={amount} onChange={e => setAmount(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/45">Equity (%)</span>
              <input value={equity} onChange={e => setEquity(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-colors" />
            </label>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/45">Pre-money Valuation ($)</span>
            <input value={valuation} onChange={e => setValuation(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50 transition-colors" />
          </label>
          <div>
            <span className="text-xs text-white/45 block mb-2">Instrument</span>
            <div className="flex gap-2">
              {["SAFE","Convertible Note","Equity"].map(ins => (
                <button key={ins} onClick={() => setInstrument(ins)}
                  className="text-xs px-4 py-2 rounded-full border transition-colors"
                  style={{
                    background: instrument === ins ? "rgba(131,56,236,0.2)" : "transparent",
                    borderColor: instrument === ins ? "#8338ec" : "rgba(255,255,255,0.12)",
                    color: instrument === ins ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                  }}>
                  {ins}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate}
            className="w-full py-3 rounded-xl text-sm font-semibold mt-2 transition-all"
            style={{ background: "rgba(131,56,236,0.25)", color: "#c4b5fd", border: "1px solid rgba(131,56,236,0.4)" }}>
            Generate Term Sheet →
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl p-6 border border-white/8 font-mono text-xs" style={{ background: "rgba(4,5,14,0.8)" }}>
        {generated ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-[9px] uppercase tracking-widest text-white/30">Term Sheet Preview</p>
              <div className="flex gap-2">
                <button className="text-[10px] px-3 py-1.5 rounded-lg border border-green-500/30 text-green-400/70 hover:text-green-400 transition-colors">
                  Sign Digitally ✍
                </button>
                <button className="text-[10px] px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/60 transition-colors">
                  Download PDF
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3 text-white/60 leading-relaxed">
              <p className="text-white/90 text-sm font-bold uppercase tracking-wider mb-2">AROVIA Investment Term Sheet</p>
              <p className="text-white/35 text-[10px]">Date: {new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}</p>
              <div className="border-t border-white/8 pt-3 mt-1">
                {[
                  ["Issuer",           company],
                  ["Instrument",       instrument],
                  ["Investment Amount", `$${Number(amount).toLocaleString()}`],
                  ["Pre-money Val.",   `$${Number(valuation).toLocaleString()}`],
                  ["Post-money Val.",  `$${(Number(valuation)+Number(amount)).toLocaleString()}`],
                  ["Equity Stake",     `${equity}%`],
                  ["Investor",         "AROVIA Investor (You)"],
                  ["Board Seat",       "Observer Rights"],
                  ["Pro-rata Rights",  "Yes, up to $500K"],
                  ["Governing Law",    "Delaware, USA"],
                ].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-white/35">{l}</span>
                    <span className="text-white/75">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/25 text-[9px] mt-3 leading-relaxed">
                This term sheet is non-binding and subject to due diligence, final approval, and execution of definitive agreements. AROVIA facilitates but is not party to this investment.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center" style={{ minHeight: 300 }}>
            <span className="text-4xl opacity-20">⬟</span>
            <p className="text-white/25 text-xs">Configure the form and click<br />Generate to preview the term sheet</p>
          </div>
        )}
      </div>
    </div>
  );
}
