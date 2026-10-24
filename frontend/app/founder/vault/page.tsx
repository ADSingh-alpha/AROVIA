"use client";
import { AppShell } from "@/app/(app)/AppShell";
import { DocumentVault } from "@/src/components/founder/DocumentVault";

export default function FounderVaultPage() {
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        <DocumentVault />
      </div>
    </AppShell>
  );
}
