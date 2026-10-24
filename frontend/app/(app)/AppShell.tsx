"use client";
import { Sidebar } from "@/src/components/Sidebar";
import { useStore } from "@/src/store/useStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useStore();
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "rgba(2,3,5,0.92)" }}>
      <Sidebar />
      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-5 h-10 flex items-center justify-center rounded-r-lg border border-white/10 text-white/30 hover:text-white/60 transition-colors"
        style={{ background: "rgba(4,5,14,0.9)", marginLeft: sidebarOpen ? "220px" : "60px", transition: "margin-left 300ms" }}
      >
        {sidebarOpen ? "‹" : "›"}
      </button>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
