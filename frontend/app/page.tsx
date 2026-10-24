import "./welcome.css";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      {/* ── Minimal top nav (ghost) ── */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-10 py-6 z-10">
        <nav className="hidden md:flex items-center gap-8 text-[10px] tracking-[0.25em] uppercase text-white/25">
          <a href="#" className="hover:text-white/60 transition-colors">Platform</a>
          <a href="#" className="hover:text-white/60 transition-colors">Investors</a>
          <a href="#" className="hover:text-white/60 transition-colors">Founders</a>
        </nav>
        <Link
          href="/dashboard"
          className="text-[10px] tracking-[0.25em] uppercase text-white/25 hover:text-white/60 transition-colors ml-auto"
        >
          Sign In →
        </Link>
      </header>

      {/* ── Centre hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 w-full">

        {/* Status chip */}
        <div
          className="inline-flex items-center gap-2 mb-10 px-5 py-2 rounded-full border border-white/10 text-[10px] tracking-[0.2em] uppercase"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-white/45">Live Pitch Sessions Active</span>
        </div>

        {/* ── AROVIA logotype — Bitcount Grid Double ── */}
        <h1 className="arovia-logotype select-none">
          AROVIA
        </h1>

        {/* Tagline */}
        <p className="arovia-tagline mt-5 mb-3">
          Pitch Your Idea to the World
        </p>

        {/* Sub-line */}
        <p className="arovia-sub mt-1 mb-14">
          Where Founders Meet Capital · Real-Time · AI-Powered
        </p>

        {/* ── Three liquid-glass CTA buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl mb-16">

          {/* 1 — Register as Startup */}
          <Link
            href="/founder/register"
            id="btn-startup"
            className="liquid-glass-btn liquid-glass-btn--startup flex-1 min-w-[200px]"
          >
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.5 9L4 20l11-4.5L9.5 9z"/>
              <path d="M14.5 9.5L20 4l-5.5 5.5z"/>
              <path d="M9.5 14.5l-2 2"/>
            </svg>
            Register as Startup
          </Link>

          {/* 2 — Register as Investor */}
          <Link
            href="/investor/portfolio"
            id="btn-investor"
            className="liquid-glass-btn liquid-glass-btn--investor flex-1 min-w-[200px]"
          >
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Register as Investor
          </Link>

          {/* 3 — Try Demo (no login — goes straight to dashboard) */}
          <Link
            href="/dashboard"
            id="btn-demo"
            className="liquid-glass-btn liquid-glass-btn--demo flex-1 min-w-[200px]"
          >
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
            </svg>
            Try Demo — No Login
          </Link>

        </div>

        {/* ── Micro-stats strip ── */}
        <div className="flex flex-wrap items-center justify-center gap-12">
          {[
            { val: "$2.4M+",  label: "Deals Closed",    color: "#8338ec" },
            { val: "312",     label: "Active Investors", color: "#fb5607" },
            { val: "1,840",   label: "Founders",         color: "#ffbe0b" },
            { val: "< 8 min", label: "Avg Deal Time",    color: "#06d6a0" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <span
                className="text-3xl font-light tabular-nums"
                style={{ fontFamily: "'Orbitron', sans-serif", color: s.color }}
              >
                {s.val}
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">
                {s.label}
              </span>
            </div>
          ))}
        </div>

      </section>

      {/* ── Scroll hint ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-hint">
        <div className="scroll-hint__bar" />
        <span className="text-[9px] tracking-[0.3em] uppercase text-white/25">Scroll</span>
      </div>

    </main>
  );
}
