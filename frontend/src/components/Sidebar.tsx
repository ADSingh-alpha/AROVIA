"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "../store/useStore";

const FOUNDER_LINKS = [
  { href: "/",                 icon: "⌂", label: "Welcome Page" },
  { href: "/dashboard",        icon: "⬡", label: "Discovery Hub" },
  { href: "/founder/register", icon: "✦", label: "My Pitch" },
  { href: "/founder/vault",    icon: "⬜", label: "Document Vault" },
  { href: "/pitch-room/neuropay", icon: "▶", label: "Live Room" },
];
const INVESTOR_LINKS = [
  { href: "/",                    icon: "⌂", label: "Welcome Page" },
  { href: "/dashboard",           icon: "⬡", label: "Discovery Hub" },
  { href: "/investor/portfolio",  icon: "◈", label: "My Portfolio" },
  { href: "/investor/deal-room/neuropay", icon: "⬟", label: "Deal Room" },
  { href: "/pitch-room/neuropay", icon: "▶", label: "Live Room" },
];
const ADMIN_LINKS = [
  { href: "/",                 icon: "⌂", label: "Welcome Page" },
  { href: "/dashboard",        icon: "⬡", label: "Discovery Hub" },
  { href: "/founder/register", icon: "✦", label: "Founders" },
  { href: "/investor/portfolio",icon: "◈", label: "Investors" },
];

export function Sidebar() {
  const { role, setRole, sidebarOpen } = useStore();
  const pathname = usePathname();
  const links = role === "founder" ? FOUNDER_LINKS : role === "admin" ? ADMIN_LINKS : INVESTOR_LINKS;

  return (
    <aside
      className="transition-all duration-300 flex flex-col shrink-0"
      style={{
        width: sidebarOpen ? "220px" : "60px",
        background: "rgba(4,5,14,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        overflowX: "hidden",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        title="Return to Welcome Page"
        className="flex items-center gap-3 px-4 py-5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
      >
        <span className="text-violet-400 text-lg font-bold shrink-0 group-hover:scale-110 transition-transform">⬡</span>
        {sidebarOpen && (
          <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: "0.7rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.7)" }}>
            AROVIA
          </span>
        )}
      </Link>

      {/* Role switcher */}
      {sidebarOpen && (
        <div className="px-3 py-3 border-b border-white/5">
          <p className="text-[9px] uppercase tracking-widest text-white/25 mb-2 px-1">Role</p>
          <div className="flex flex-col gap-1">
            {(["founder","investor","admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className="text-left text-xs px-3 py-1.5 rounded capitalize transition-colors"
                style={{
                  background: role === r ? "rgba(131,56,236,0.2)" : "transparent",
                  color: role === r ? "#a78bfa" : "rgba(255,255,255,0.35)",
                  border: role === r ? "1px solid rgba(131,56,236,0.35)" : "1px solid transparent",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-2 py-4 flex-1">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{
                background: active ? "rgba(131,56,236,0.18)" : "transparent",
                color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)",
              }}
            >
              <span className="text-base shrink-0">{l.icon}</span>
              {sidebarOpen && <span className="text-xs truncate">{l.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Live indicator */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest text-white/30">3 Sessions Live</span>
          </div>
        </div>
      )}
    </aside>
  );
}
