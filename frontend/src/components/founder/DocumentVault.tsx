"use client";
import { useState, useCallback } from "react";
import { MOCK_DOCUMENTS } from "@/src/lib/mockData";
import type { Document } from "@/src/lib/mockData";

const TYPE_ICON: Record<string, string> = {
  "pitch-deck": "📄",
  "financial-model": "📊",
  "cap-table": "⬡",
  "credential": "🔐",
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  verified: { color: "#06d6a0", bg: "rgba(6,214,160,0.12)" },
  pending:  { color: "#ffbe0b", bg: "rgba(255,190,11,0.12)" },
  rejected: { color: "#ff006e", bg: "rgba(255,0,110,0.12)" },
};

export function DocumentVault() {
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCUMENTS);
  const [dragging, setDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const newDocs: Document[] = files.map((f, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: f.name,
      type: f.name.includes(".pdf") ? "pitch-deck" :
            f.name.includes(".xlsx") ? "financial-model" : "credential",
      size: `${(f.size/1024/1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().slice(0,10),
      status: "pending",
    }));
    setDocs(prev => [...prev, ...newDocs]);
  }, []);

  const removeDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">Module 3 · Document Vault</p>
        <h1 className="text-2xl font-light text-white" style={{ fontFamily:"'Orbitron',sans-serif" }}>
          Cap Table & Document Vault
        </h1>
        <p className="text-sm text-white/40 mt-1">Secure drag-and-drop upload for pitch decks, financial models, and credentials</p>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className="rounded-2xl border-2 border-dashed p-12 flex flex-col items-center justify-center gap-4 text-center mb-8 transition-all cursor-pointer"
        style={{
          borderColor: dragging ? "#8338ec" : "rgba(255,255,255,0.12)",
          background: dragging ? "rgba(131,56,236,0.08)" : "rgba(255,255,255,0.02)",
        }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center border border-white/15"
          style={{ background: dragging ? "rgba(131,56,236,0.15)" : "rgba(255,255,255,0.05)" }}>
          <span className="text-xl">{dragging ? "⬇" : "⬆"}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white mb-1">
            {dragging ? "Drop to upload" : "Drag & drop files here"}
          </p>
          <p className="text-xs text-white/35">PDF, XLSX, ZIP accepted · Max 50 MB per file</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" multiple onChange={e => {
            const files = Array.from(e.target.files ?? []);
            const newDocs: Document[] = files.map((f,i) => ({
              id: `upload-${Date.now()}-${i}`,
              name: f.name,
              type: f.name.includes(".pdf") ? "pitch-deck" : f.name.includes(".xlsx") ? "financial-model" : "credential",
              size: `${(f.size/1024/1024).toFixed(1)} MB`,
              uploadedAt: new Date().toISOString().slice(0,10),
              status: "pending",
            }));
            setDocs(prev => [...prev, ...newDocs]);
          }} />
          <span className="text-xs px-4 py-2 rounded-full border border-white/15 text-white/45 hover:border-white/30 hover:text-white/70 transition-colors">
            Browse Files
          </span>
        </label>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { type:"pitch-deck",       label:"Pitch Decks",      count: docs.filter(d=>d.type==="pitch-deck").length },
          { type:"financial-model",  label:"Financial Models", count: docs.filter(d=>d.type==="financial-model").length },
          { type:"cap-table",        label:"Cap Tables",       count: docs.filter(d=>d.type==="cap-table").length },
          { type:"credential",       label:"Credentials",      count: docs.filter(d=>d.type==="credential").length },
        ].map(c => (
          <div key={c.type} className="rounded-xl p-4 border border-white/8 text-center"
            style={{ background:"rgba(255,255,255,0.02)" }}>
            <span className="text-2xl mb-2 block">{TYPE_ICON[c.type]}</span>
            <p className="text-xs text-white/50 mb-1">{c.label}</p>
            <p className="text-lg font-mono text-white">{c.count}</p>
          </div>
        ))}
      </div>

      {/* Document list */}
      <div className="flex flex-col gap-2">
        {docs.map(doc => (
          <div key={doc.id}
            className="flex items-center gap-4 rounded-xl px-5 py-4 border border-white/8 group hover:border-white/15 transition-colors"
            style={{ background:"rgba(255,255,255,0.02)" }}>
            <span className="text-2xl shrink-0">{TYPE_ICON[doc.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{doc.name}</p>
              <p className="text-[10px] text-white/35">{doc.size} · Uploaded {doc.uploadedAt}</p>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full capitalize shrink-0"
              style={{ color:STATUS_STYLE[doc.status].color, background:STATUS_STYLE[doc.status].bg }}>
              {doc.status}
            </span>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                View
              </button>
              <button onClick={() => removeDoc(doc.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400/60 hover:text-red-400 transition-colors">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
