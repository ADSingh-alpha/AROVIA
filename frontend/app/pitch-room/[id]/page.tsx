"use client";
import { use } from "react";
import { AppShell } from "@/app/(app)/AppShell";
import { LiveRoom } from "@/src/components/LiveRoom/LiveRoom";

export default function PitchRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <AppShell>
      <div className="h-full overflow-hidden">
        <LiveRoom startupId={id} />
      </div>
    </AppShell>
  );
}
