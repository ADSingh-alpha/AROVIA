"use client";
import { AppShell } from "@/app/(app)/AppShell";
import { OnboardingWizard } from "@/src/components/founder/OnboardingWizard";

export default function FounderRegisterPage() {
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        <OnboardingWizard />
      </div>
    </AppShell>
  );
}
