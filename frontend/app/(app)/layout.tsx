import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AROVIA Dashboard",
  description: "AROVIA — The Online Pitching Platform. Discover, pitch, and invest in real time.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // Note: AppShell is a client component rendered inside each page to avoid RSC issues
  return <>{children}</>;
}
