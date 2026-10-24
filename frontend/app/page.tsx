import "./welcome.css";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">

      {/* ── Minimal top bar ── */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <span
          className="font-bold tracking-[0.3em] text-xs uppercase"
          style={{ fontFamily: "'Orbitron', sans-serif", color: "rgba(255,255,255,0.35)" }}
        >
          AROVIA
        </span>
        <nav className="hidden md:flex items-center gap-7 text-xs tracking-widest uppercase text-white/30">
          <a href="#" className="hover:text-white/70 transition-colors">Platform</a>
          <a href="#" className="hover:text-white/70 transition-colors">Investors</a>
          <a href="#" className="hover:text-white/70 transition-colors">Founders</a>
        </nav>
        <button className="text-xs tracking-widest uppercase text-white/30 hover:text-white/70 transition-colors">
          Sign In
        </button>
      </header>

      {/* ── Hero — centred welcome ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative">

        {/* Decorative pulse rings behind the logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="relative w-64 h-64">
            <div className="pulse-ring absolute inset-0" />
            <div className="pulse-ring absolute inset-0" />
            <div className="pulse-ring absolute inset-0" />
          </div>
        </div>

        {/* ── Status chip ── */}
        <div
          className="inline-flex items-center gap-2 mb-10 px-5 py-2 rounded-full border border-white/10 text-xs tracking-[0.2em] uppercase"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-white/45">Live Pitch Sessions Active</span>
        </div>

        {/* ── AROVIA logotype ── */}
        <h1 className="arovia-logotype select-none">
          AROVIA
        </h1>

        {/* ── Tagline ── */}
        <p className="arovia-tagline mt-4 mb-3">
          Pitch Your Idea to the World
        </p>

        {/* ── Sub-line ── */}
        <p className="arovia-sub mt-1 mb-12">
          Where Founders Meet Capital · Real-Time · AI-Powered
        </p>

        {/* ── Three liquid-glass CTA buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-2xl">

          {/* 1 — Register as Startup */}
          <button
            id="btn-startup"
            className="liquid-glass-btn liquid-glass-btn--startup flex-1 min-w-[200px]"
          >
            {/* Rocket icon */}
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" opacity="0"/>
              <path d="M9.5 9L4 20l11-4.5L9.5 9z"/>
              <path d="M14.5 9.5L20 4l-5.5 5.5z"/>
              <path d="M9.5 14.5l-2 2"/>
            </svg>
            Register as Startup
          </button>

          {/* 2 — Register as Investor */}
          <button
            id="btn-investor"
            className="liquid-glass-btn liquid-glass-btn--investor flex-1 min-w-[200px]"
          >
            {/* Briefcase / dollar icon */}
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Register as Investor
          </button>

          {/* 3 — Watch Demo */}
          <button
            id="btn-demo"
            className="liquid-glass-btn liquid-glass-btn--demo flex-1 min-w-[200px]"
          >
            {/* Play icon */}
            <svg className="liquid-glass-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/>
            </svg>
            Watch Demo
          </button>

        </div>

        {/* ── Micro-stats strip ── */}
        <div className="flex flex-wrap items-center justify-center gap-10 mt-16 mb-4">
          {[
            { val: "$2.4M+",  label: "Deals Closed",      color: "#8338ec" },
            { val: "312",     label: "Active Investors",   color: "#fb5607" },
            { val: "1,840",   label: "Founders",           color: "#ffbe0b" },
            { val: "< 8 min", label: "Avg Deal Time",      color: "#06d6a0" },
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

        {/* ── Scroll hint ── */}
        <div className="scroll-hint mt-10">
          <div className="scroll-hint__bar" />
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/25">Scroll</span>
        </div>

      </section>

      {/* ── Live pitch ticker ── */}
      <section className="border-t border-white/5 px-8 py-10">
        <p className="text-center text-[10px] tracking-[0.3em] uppercase text-white/25 mb-6">
          Live Sessions Now
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {[
            { name: "NeuroPay",   sector: "FinTech",   ask: "$500K",  stage: "LIVE",   color: "#8338ec" },
            { name: "GreenStack", sector: "CleanTech", ask: "$1.2M",  stage: "LIVE",   color: "#06d6a0" },
            { name: "Cognify",    sector: "AI / ML",   ask: "$800K",  stage: "REVIEW", color: "#3a86ff" },
            { name: "FluxCore",   sector: "DeepTech",  ask: "$2M",    stage: "LIVE",   color: "#fb5607" },
          ].map((pitch) => (
            <div
              key={pitch.name}
              className="rounded-xl p-4 border border-white/8 cursor-pointer transition-all duration-200 hover:border-white/20"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 20px ${pitch.color}22`,
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-semibold text-white">{pitch.name}</span>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: pitch.stage === "LIVE" ? `${pitch.color}28` : "rgba(255,255,255,0.06)",
                    color:      pitch.stage === "LIVE" ? pitch.color : "rgba(255,255,255,0.35)",
                    border:     `1px solid ${pitch.stage === "LIVE" ? pitch.color + "55" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {pitch.stage}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">{pitch.sector}</span>
                <span style={{ color: pitch.color, fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem" }}>
                  {pitch.ask}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-8 py-5 flex items-center justify-between">
        <span className="text-[10px] tracking-widest uppercase text-white/20"
          style={{ fontFamily: "'Orbitron', sans-serif" }}>
          AROVIA © 2025
        </span>
        <span className="text-[10px] tracking-widest uppercase text-white/20">
          AI-Powered · Real-Time · Decentralized
        </span>
      </footer>

    </main>
  );
}
