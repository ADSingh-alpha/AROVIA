"use client";
import { AppShell } from "@/app/(app)/AppShell";
import { DiscoveryHub } from "../../src/components/DiscoveryHub";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        <DiscoveryHub />
      </div>
    </AppShell>
  );
}
