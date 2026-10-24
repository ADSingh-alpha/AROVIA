"use client";
import { useState, useCallback } from "react";
import { useStore } from "@/src/store/useStore";

const STEPS = [
  { title: "Company Info",    desc: "Tell us about your startup" },
  { title: "Elevator Pitch",  desc: "One compelling paragraph" },
  { title: "Industry & Stage", desc: "Categorize your business" },
  { title: "Funding Ask",     desc: "How much and for what" },
  { title: "Contact & Submit", desc: "Finish registration" },
];

const INDUSTRIES = ["FinTech","CleanTech","AI / ML","DeepTech","HealthTech","CyberSec","EdTech","Other"];
const STAGES = ["Pre-Seed","Seed","Series A","Series B"];

export function OnboardingWizard() {
  const { wizardStep, setWizardStep, wizardData, setWizardData } = useStore();
  const [submitted, setSubmitted] = useState(false);

  const field = (k: string) => wizardData[k] ?? "";

  const next = () => wizardStep < STEPS.length - 1 && setWizardStep(wizardStep + 1);
  const prev = () => wizardStep > 0 && setWizardStep(wizardStep - 1);

  const handleSubmit = () => setSubmitted(true);

  if (submitted) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
      <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-green-400/50"
        style={{ background:"rgba(6,214,160,0.15)" }}>
        <span className="text-2xl text-green-400">✓</span>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white mb-2">Pitch Submitted!</h2>
        <p className="text-sm text-white/50">
          Your pitch for <strong className="text-white">{field("companyName")}</strong> is under review.
          You'll be notified when a live slot is assigned.
        </p>
      </div>
      <button onClick={() => { setSubmitted(false); setWizardStep(0); }}
        className="text-sm text-white/40 hover:text-white/70 transition-colors underline">
        Submit another pitch
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">Module 3 · Founder Hub</p>
        <h1 className="text-2xl font-light text-white" style={{ fontFamily:"'Orbitron',sans-serif" }}>
          Register Your Startup
        </h1>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => i < wizardStep && setWizardStep(i)}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all"
                style={{
                  background: i < wizardStep ? "rgba(6,214,160,0.2)" : i === wizardStep ? "rgba(131,56,236,0.2)" : "transparent",
                  borderColor: i < wizardStep ? "#06d6a0" : i === wizardStep ? "#8338ec" : "rgba(255,255,255,0.15)",
                  color: i < wizardStep ? "#06d6a0" : i === wizardStep ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                }}>
                {i < wizardStep ? "✓" : i + 1}
              </div>
              <span className="text-[9px] text-center text-white/30 hidden md:block max-w-[80px] leading-tight">{s.title}</span>
            </div>
          ))}
        </div>
        <div className="h-1 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width:`${(wizardStep/(STEPS.length-1))*100}%`, background:"linear-gradient(90deg,#8338ec,#06d6a0)" }} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 rounded-xl p-6 border border-white/10 mb-6"
        style={{ background:"rgba(4,5,14,0.6)" }}>
        <h2 className="text-base font-semibold text-white mb-1">{STEPS[wizardStep].title}</h2>
        <p className="text-xs text-white/40 mb-6">{STEPS[wizardStep].desc}</p>

        {wizardStep === 0 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Company Name *</span>
              <input value={field("companyName")} onChange={e=>setWizardData("companyName",e.target.value)}
                placeholder="e.g. NeuroPay"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Website</span>
              <input value={field("website")} onChange={e=>setWizardData("website",e.target.value)}
                placeholder="https://yourcompany.com"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Founder Name *</span>
              <input value={field("founderName")} onChange={e=>setWizardData("founderName",e.target.value)}
                placeholder="Your full name"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
          </div>
        )}

        {wizardStep === 1 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-white/50">Elevator Pitch (max 300 chars) *</span>
            <textarea value={field("pitch")} onChange={e=>setWizardData("pitch",e.target.value)}
              placeholder="We are building [X] for [Y] who struggle with [Z]. Unlike [alternatives], we [differentiator]."
              rows={6}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors resize-none" />
            <span className="text-[10px] text-white/25 text-right">{(field("pitch")).length}/300</span>
          </label>
        )}

        {wizardStep === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs text-white/50 mb-3">Industry *</p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setWizardData("industry", ind)}
                    className="text-xs px-4 py-2 rounded-full border transition-colors"
                    style={{
                      background: field("industry")===ind ? "rgba(131,56,236,0.2)" : "transparent",
                      borderColor: field("industry")===ind ? "#8338ec" : "rgba(255,255,255,0.12)",
                      color: field("industry")===ind ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                    }}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-3">Funding Stage *</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(st => (
                  <button key={st} onClick={() => setWizardData("stage", st)}
                    className="text-xs px-4 py-2 rounded-full border transition-colors"
                    style={{
                      background: field("stage")===st ? "rgba(6,214,160,0.15)" : "transparent",
                      borderColor: field("stage")===st ? "#06d6a0" : "rgba(255,255,255,0.12)",
                      color: field("stage")===st ? "#06d6a0" : "rgba(255,255,255,0.4)",
                    }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {wizardStep === 3 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Funding Ask (USD) *</span>
              <input value={field("ask")} onChange={e=>setWizardData("ask",e.target.value)}
                placeholder="e.g. 500000"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Equity Offered (%)</span>
              <input value={field("equity")} onChange={e=>setWizardData("equity",e.target.value)}
                placeholder="e.g. 8"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Use of Funds</span>
              <textarea value={field("useOfFunds")} onChange={e=>setWizardData("useOfFunds",e.target.value)}
                placeholder="40% hiring, 35% product, 25% marketing…" rows={3}
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors resize-none" />
            </label>
          </div>
        )}

        {wizardStep === 4 && (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">Email *</span>
              <input value={field("email")} onChange={e=>setWizardData("email",e.target.value)}
                placeholder="founder@startup.com"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs text-white/50">LinkedIn</span>
              <input value={field("linkedin")} onChange={e=>setWizardData("linkedin",e.target.value)}
                placeholder="linkedin.com/in/yourname"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-colors" />
            </label>

            {/* Summary */}
            <div className="rounded-lg p-4 border border-white/8 mt-2" style={{ background:"rgba(255,255,255,0.02)" }}>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mb-3">Summary</p>
              {[
                ["Company", field("companyName") || "—"],
                ["Founder", field("founderName") || "—"],
                ["Industry", field("industry") || "—"],
                ["Stage", field("stage") || "—"],
                ["Ask", field("ask") ? `$${Number(field("ask")).toLocaleString()}` : "—"],
              ].map(([l,v]) => (
                <div key={l} className="flex justify-between text-xs py-1 border-b border-white/5">
                  <span className="text-white/35">{l}</span>
                  <span className="text-white/70">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {wizardStep > 0 && (
          <button onClick={prev}
            className="flex-1 py-3 rounded-xl text-sm border transition-colors"
            style={{ border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.45)" }}>
            ← Back
          </button>
        )}
        {wizardStep < STEPS.length - 1 ? (
          <button onClick={next}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background:"rgba(131,56,236,0.25)", color:"#c4b5fd", border:"1px solid rgba(131,56,236,0.4)" }}>
            Continue →
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background:"rgba(6,214,160,0.2)", color:"#06d6a0", border:"1px solid rgba(6,214,160,0.4)" }}>
            Submit Pitch ✓
          </button>
        )}
      </div>
    </div>
  );
}
