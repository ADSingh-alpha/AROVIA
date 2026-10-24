"use client";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/src/store/useStore";
import { STARTUPS } from "@/src/lib/mockData";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n/1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ── Video Grid ─────────────────────────────────────────────
function VideoGrid({ startup }: { startup: typeof STARTUPS[0] }) {
  const investors = ["Alex C.", "Sarah K.", "Raj P.", "Emma L."];
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Main presenter */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-white/10"
        style={{ background: `${startup.color}11`, minHeight: 200 }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2"
            style={{ background: `${startup.color}33`, borderColor: startup.color, color: startup.color }}>
            {startup.avatar}
          </div>
          <p className="text-sm text-white/80 font-medium">{startup.founder}</p>
          <p className="text-xs text-white/40">Presenter · {startup.name}</p>
        </div>
        {/* Fake waveform */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-0.5 h-6">
          {Array.from({length:40},(_,i) => (
            <div key={i} className="flex-1 rounded-sm"
              style={{ height:`${15+Math.abs(Math.sin(i*0.7+Date.now()*0.001))*85}%`, background:`${startup.color}66` }} />
          ))}
        </div>
        <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full"
          style={{ background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", color:"#fca5a5" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          LIVE
        </div>
        <div className="absolute top-3 right-3 text-[10px] text-white/40 px-2 py-1 rounded"
          style={{ background:"rgba(0,0,0,0.4)" }}>
          {startup.viewers} watching
        </div>
      </div>

      {/* Investor grid */}
      <div className="grid grid-cols-4 gap-2">
        {investors.map((inv, i) => (
          <div key={inv} className="aspect-video rounded-lg flex items-center justify-center border border-white/8 relative"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            <span className="text-[10px] text-white/50">{inv}</span>
            {i === 0 && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-green-400" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat Panel ─────────────────────────────────────────────
function ChatPanel({ startupId }: { startupId: string }) {
  const { messages, addMessage, role } = useStore();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    addMessage({ sender: role === "investor" ? "You (Investor)" : "You (Founder)", role, text: input.trim() });
    setInput("");
  };

  const ROLE_COLOR: Record<string,string> = { investor:"#8338ec", founder:"#06d6a0", admin:"#ffbe0b" };

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Live Q&A</p>
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold" style={{ color: ROLE_COLOR[m.role] || "#fff" }}>
                {m.sender}
              </span>
              <span className="text-[9px] text-white/20">
                {new Date(m.ts).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{m.text}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask a question…"
          className="flex-1 text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/25 outline-none focus:border-violet-500/50"
        />
        <button onClick={send}
          className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{ background:"rgba(131,56,236,0.25)", color:"#c4b5fd", border:"1px solid rgba(131,56,236,0.4)" }}>
          ↑
        </button>
      </div>
    </div>
  );
}

// ── Commitment Panel ────────────────────────────────────────
function CommitmentPanel({ startup }: { startup: typeof STARTUPS[0] }) {
  const { offers, submitOffer, updateOffer, role } = useStore();
  const [amount, setAmount] = useState("");
  const [equity, setEquity] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const totalCommitted = offers.reduce((s,o) => s + (o.status !== "rejected" ? o.amount : 0), 0);

  const handleSubmit = () => {
    const a = parseFloat(amount.replace(/[^0-9.]/g,""));
    const e = parseFloat(equity);
    if (!a || !e) return;
    submitOffer(a, e);
    setAmount("");
    setEquity("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Commitment Panel</p>

      {/* Progress */}
      <div className="rounded-xl p-4 border border-white/8" style={{ background:"rgba(255,255,255,0.02)" }}>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-white/40">Committed</span>
          <span className="font-mono" style={{ color:startup.color }}>{fmt(totalCommitted)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 mb-1">
          <div className="h-full rounded-full" style={{ width:`${Math.min(100,(totalCommitted/startup.ask)*100)}%`, background:startup.color }} />
        </div>
        <p className="text-[10px] text-white/25 text-right">Goal: {fmt(startup.ask)}</p>
      </div>

      {/* Live offers */}
      <div className="flex flex-col gap-2">
        {offers.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-lg px-3 py-2 border border-white/8"
            style={{ background:"rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-xs text-white/70">{o.investor}</p>
              <p className="text-[10px] text-white/35">{fmt(o.amount)} · {o.equity}%</p>
            </div>
            {role === "founder" && o.status === "pending" ? (
              <div className="flex gap-1">
                <button onClick={() => updateOffer(o.id,"accepted")}
                  className="text-[10px] px-2 py-1 rounded" style={{ background:"rgba(6,214,160,0.2)", color:"#06d6a0" }}>✓</button>
                <button onClick={() => updateOffer(o.id,"rejected")}
                  className="text-[10px] px-2 py-1 rounded" style={{ background:"rgba(239,68,68,0.15)", color:"#fca5a5" }}>✗</button>
              </div>
            ) : (
              <span className={`text-[9px] px-2 py-0.5 rounded-full capitalize ${
                o.status==="accepted" ? "text-green-400 bg-green-400/15" :
                o.status==="rejected" ? "text-red-400 bg-red-400/15" :
                "text-yellow-400 bg-yellow-400/15"
              }`}>{o.status}</span>
            )}
          </div>
        ))}
      </div>

      {/* Make offer form */}
      {role === "investor" && (
        <div className="rounded-xl p-4 border border-violet-500/25" style={{ background:"rgba(131,56,236,0.07)" }}>
          <p className="text-xs text-white/50 mb-3">Make an Offer</p>
          <div className="flex gap-2 mb-2">
            <input value={amount} onChange={e=>setAmount(e.target.value)}
              placeholder="Amount ($)" className="flex-1 text-xs bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/25 outline-none focus:border-violet-500/50" />
            <input value={equity} onChange={e=>setEquity(e.target.value)}
              placeholder="Equity %" className="w-24 text-xs bg-white/5 border border-white/10 rounded px-3 py-2 text-white placeholder-white/25 outline-none focus:border-violet-500/50" />
          </div>
          <button onClick={handleSubmit}
            className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: submitted ? "rgba(6,214,160,0.25)" : "rgba(131,56,236,0.3)", color: submitted ? "#06d6a0" : "#c4b5fd", border: `1px solid ${submitted ? "rgba(6,214,160,0.4)" : "rgba(131,56,236,0.5)"}` }}>
            {submitted ? "✓ Offer Submitted!" : "Submit Offer"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Metrics Panel ───────────────────────────────────────────
function MetricsPanel({ startup }: { startup: typeof STARTUPS[0] }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] uppercase tracking-widest text-white/30">Live Metrics</p>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label:"Valuation", value: fmt(startup.valuation), color:"#8338ec" },
          { label:"ARR",       value: fmt(startup.metrics[startup.metrics.length-1].revenue * 12), color:"#06d6a0" },
          { label:"MAU",       value: (startup.metrics[startup.metrics.length-1].users/1000).toFixed(1)+"K", color:"#3a86ff" },
          { label:"Equity",    value: startup.equity+"%", color:"#fb5607" },
        ].map(m => (
          <div key={m.label} className="rounded-xl p-3 border border-white/8" style={{ background:"rgba(255,255,255,0.02)" }}>
            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-1">{m.label}</p>
            <p className="text-lg font-mono" style={{ color:m.color, fontFamily:"'Orbitron',sans-serif", fontSize:"1rem" }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl p-3 border border-white/8" style={{ background:"rgba(255,255,255,0.02)" }}>
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Revenue Trend</p>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={startup.metrics}>
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={startup.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={startup.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize:9, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#0a0a0a", border:"1px solid rgba(255,255,255,0.1)", fontSize:10, color:"#fff" }}
              formatter={(v:number) => [fmt(v), "Revenue"]} />
            <Area type="monotone" dataKey="revenue" stroke={startup.color} strokeWidth={2} fill="url(#rev)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* User growth */}
      <div className="rounded-xl p-3 border border-white/8" style={{ background:"rgba(255,255,255,0.02)" }}>
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">User Growth</p>
        <ResponsiveContainer width="100%" height={80}>
          <LineChart data={startup.metrics}>
            <XAxis dataKey="month" tick={{ fontSize:9, fill:"rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background:"#0a0a0a", border:"1px solid rgba(255,255,255,0.1)", fontSize:10, color:"#fff" }}
              formatter={(v:number) => [(v/1000).toFixed(1)+"K", "Users"]} />
            <Line type="monotone" dataKey="users" stroke="#3a86ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Traction */}
      <div className="rounded-xl p-3 border border-white/8" style={{ background:"rgba(255,255,255,0.02)" }}>
        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Traction</p>
        <p className="text-xs font-mono text-white/60">{startup.traction}</p>
      </div>
    </div>
  );
}

// ── Main LiveRoom export ────────────────────────────────────
export function LiveRoom({ startupId }: { startupId: string }) {
  const startup = STARTUPS.find(s => s.id === startupId) ?? STARTUPS[0];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0"
        style={{ background:"rgba(4,5,14,0.7)" }}>
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background:`${startup.color}33`, color:startup.color }}>{startup.avatar}</div>
          <div>
            <p className="text-sm font-semibold text-white">{startup.name}</p>
            <p className="text-[10px] text-white/40">{startup.industry} · {startup.stage} · Asking {fmt(startup.ask)} for {startup.equity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/30">{startup.viewers} viewers</span>
          <span className="text-[10px] px-2 py-1 rounded-full animate-pulse"
            style={{ background:"rgba(239,68,68,0.15)", color:"#fca5a5", border:"1px solid rgba(239,68,68,0.3)" }}>
            ● LIVE
          </span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video + chat — left 2/3 */}
        <div className="flex flex-col flex-1 overflow-hidden p-4 gap-4">
          <div className="flex-1 min-h-0"><VideoGrid startup={startup} /></div>
          <div className="h-72 rounded-xl p-4 border border-white/8 overflow-hidden flex flex-col"
            style={{ background:"rgba(4,5,14,0.6)" }}>
            <ChatPanel startupId={startupId} />
          </div>
        </div>

        {/* Sidebar panels — right 1/3 */}
        <div className="w-80 shrink-0 flex flex-col gap-4 p-4 overflow-y-auto border-l border-white/8">
          <div className="rounded-xl p-4 border border-white/8" style={{ background:"rgba(4,5,14,0.6)" }}>
            <CommitmentPanel startup={startup} />
          </div>
          <div className="rounded-xl p-4 border border-white/8" style={{ background:"rgba(4,5,14,0.6)" }}>
            <MetricsPanel startup={startup} />
          </div>
        </div>
      </div>
    </div>
  );
}
