"use client";
import { use } from "react";
import { AppShell } from "@/app/(app)/AppShell";
import { PortfolioDashboard } from "@/src/components/investor/PortfolioDashboard";

export default function DealRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        {/* Reuses portfolio dashboard — term sheet tab opened for this company */}
        <PortfolioDashboard />
      </div>
    </AppShell>
  );
}
