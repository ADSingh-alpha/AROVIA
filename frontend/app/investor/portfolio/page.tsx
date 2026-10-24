"use client";
import { AppShell } from "@/app/(app)/AppShell";
import { PortfolioDashboard } from "@/src/components/investor/PortfolioDashboard";

export default function InvestorPortfolioPage() {
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        <PortfolioDashboard />
      </div>
    </AppShell>
  );
}
