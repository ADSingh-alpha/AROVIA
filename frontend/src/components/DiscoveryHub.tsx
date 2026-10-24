"use client";
import Link from "next/link";
import { useStore } from "@/src/store/useStore";
import { STARTUPS } from "@/src/lib/mockData";

const INDUSTRIES = ["All","FinTech","CleanTech","AI / ML","DeepTech","HealthTech","CyberSec"];
const STAGES     = ["All","Pre-Seed","Seed","Series A","Series B"];

const STATUS_COLOR: Record<string,string> = {
  live:     "#06d6a0",
  review:   "#ffbe0b",
  closed:   "#8338ec",
  upcoming: "#3a86ff",
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n/1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function DiscoveryHub() {
  const { industryFilter, stageFilter, setIndustryFilter, setStageFilter } = useStore();

  const filtered = STARTUPS.filter((s) =>
    (industryFilter === "All" || s.industry === industryFilter) &&
    (stageFilter    === "All" || s.stage    === stageFilter)
  );

  const live = filtered.filter(s => s.status === "live");

  return (
    <div className="flex flex-col gap-8 p-8 overflow-y-auto h-full">

      {/* ── Section header ── */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">Module 1</p>
        <h1 className="text-2xl font-light text-white" style={{ fontFamily:"'Orbitron',sans-serif" }}>
          Discovery Hub
        </h1>
        <p className="text-sm text-white/40 mt-1">Live pitch carousels · Funding trackers · Filterable startup cards</p>
      </div>

      {/* ── Live carousel ── */}
      {live.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live Right Now
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {live.map((s) => (
              <Link
                href={`/pitch-room/${s.id}`}
                key={s.id}
                className="shrink-0 w-72 rounded-xl p-5 border border-white/8 cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.03)", boxShadow: `0 0 30px ${s.color}22` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: `${s.color}33`, color: s.color }}>
                      {s.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-white/40">{s.industry} · {s.stage}</p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full border animate-pulse"
                    style={{ color: STATUS_COLOR[s.status], borderColor: `${STATUS_COLOR[s.status]}55`, background: `${STATUS_COLOR[s.status]}15` }}>
                    LIVE
                  </span>
                </div>

                <p className="text-xs text-white/50 mb-4 leading-relaxed line-clamp-2">{s.tagline}</p>

                {/* Funding progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-white/40 mb-1">
                    <span>{fmt(s.raised)} raised</span>
                    <span>{fmt(s.ask)} goal</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100,(s.raised/s.ask)*100)}%`, background: s.color }} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/30">{s.viewers} watching</span>
                  <span className="text-[10px] font-mono" style={{ color: s.color }}>{s.equity}% equity</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-6">
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Industry</p>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((i) => (
              <button key={i} onClick={() => setIndustryFilter(i)}
                className="text-[10px] px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  background: industryFilter===i ? "rgba(131,56,236,0.2)" : "transparent",
                  borderColor: industryFilter===i ? "#8338ec" : "rgba(255,255,255,0.12)",
                  color: industryFilter===i ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                }}>
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2">Stage</p>
          <div className="flex flex-wrap gap-2">
            {STAGES.map((s) => (
              <button key={s} onClick={() => setStageFilter(s)}
                className="text-[10px] px-3 py-1.5 rounded-full border transition-colors"
                style={{
                  background: stageFilter===s ? "rgba(6,214,160,0.15)" : "transparent",
                  borderColor: stageFilter===s ? "#06d6a0" : "rgba(255,255,255,0.12)",
                  color: stageFilter===s ? "#06d6a0" : "rgba(255,255,255,0.4)",
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── All startup cards ── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-white/30 mb-4">
          All Pitches ({filtered.length})
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link
              href={s.status !== "upcoming" ? `/pitch-room/${s.id}` : "#"}
              key={s.id}
              className="rounded-xl p-5 border border-white/8 group cursor-pointer transition-all duration-200 hover:border-white/20 block"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: `${s.color}33`, color: s.color }}>
                    {s.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-[10px] text-white/35">{s.industry}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] px-2 py-0.5 rounded-full border capitalize"
                    style={{ color: STATUS_COLOR[s.status], borderColor: `${STATUS_COLOR[s.status]}44`, background: `${STATUS_COLOR[s.status]}12` }}>
                    {s.status}
                  </span>
                  <span className="text-[9px] text-white/25 rounded px-1.5 py-0.5 border border-white/10">{s.stage}</span>
                </div>
              </div>

              <p className="text-xs text-white/45 mb-4 leading-relaxed">{s.tagline}</p>

              {/* Mini traction pill */}
              <p className="text-[10px] text-white/30 mb-4 font-mono">{s.traction}</p>

              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div>
                  <p className="text-[9px] text-white/25">Asking</p>
                  <p className="text-sm font-mono" style={{ color: s.color }}>{fmt(s.ask)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Valuation</p>
                  <p className="text-sm font-mono text-white/70">{fmt(s.valuation)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-white/25">Equity</p>
                  <p className="text-sm font-mono text-white/70">{s.equity}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
