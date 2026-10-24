export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold tracking-widest text-sm uppercase">
            AROVIA
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/50">
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Investors</a>
          <a href="#" className="hover:text-white transition-colors">Founders</a>
          <a href="#" className="hover:text-white transition-colors">Docs</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Sign In
          </button>
          <button className="text-sm bg-white text-black font-medium px-4 py-2 rounded hover:bg-white/90 transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-8 text-xs tracking-widest uppercase text-white/60">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live Pitching Sessions Active
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white leading-none mb-6 max-w-4xl">
          Where Vision
          <br />
          <span className="italic text-white/40">Meets Capital</span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-xl leading-relaxed mb-12">
          AROVIA is the online Shark Tank. Pitch your startup live to decision-making investors, 
          receive real-time AI analysis, and close deals on the spot.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            id="cta-pitch"
            className="px-8 py-4 bg-white text-black text-sm font-medium rounded hover:bg-white/90 transition-colors w-full sm:w-auto"
          >
            Submit a Pitch
          </button>
          <button
            id="cta-invest"
            className="px-8 py-4 glass-card text-white text-sm font-medium rounded hover:border-white/30 transition-colors w-full sm:w-auto"
          >
            Join as Investor
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-12 mt-20 text-center">
          {[
            { label: "Pitches Funded", value: "$2.4M+" },
            { label: "Active Investors", value: "312" },
            { label: "Founders Onboard", value: "1,840" },
            { label: "Avg. Deal Time", value: "8 min" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-3xl font-light text-white tabular-nums">{stat.value}</span>
              <span className="text-xs text-white/40 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Pitch Feed ── */}
      <section className="px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm uppercase tracking-widest text-white/40 font-mono">
              Live Sessions
            </h2>
            <span className="text-xs text-white/30 font-mono">4 active now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: "NeuroPay", sector: "FinTech", ask: "$500K", stage: "LIVE" },
              { name: "GreenStack", sector: "CleanTech", ask: "$1.2M", stage: "LIVE" },
              { name: "Cognify", sector: "AI/ML", ask: "$800K", stage: "REVIEW" },
              { name: "FluxCore", sector: "DeepTech", ask: "$2M", stage: "LIVE" },
            ].map((pitch) => (
              <div
                key={pitch.name}
                className="glass-card p-5 flex flex-col gap-3 cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <span className="text-white font-medium text-sm">{pitch.name}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
                      pitch.stage === "LIVE"
                        ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    {pitch.stage}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{pitch.sector}</span>
                  <span className="font-mono text-amber-400/80">{pitch.ask}</span>
                </div>
                {/* Fake waveform */}
                <div className="flex items-end gap-0.5 h-6 opacity-30 group-hover:opacity-60 transition-opacity">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white rounded-sm"
                      style={{ height: `${20 + Math.sin(i * 0.9) * 15 + Math.cos(i * 1.3) * 10}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-white/25 font-mono">
        <span>AROVIA © 2025</span>
        <span>AI-POWERED · REAL-TIME · DECENTRALIZED</span>
      </footer>
    </main>
  );
}
