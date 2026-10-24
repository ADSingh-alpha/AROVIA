"use client";

import { lazy, Suspense } from "react";

// Lazy-load the WebGL renderer — only runs in the browser
const LaserVariants = lazy(() =>
  import("./LaserVariants").then((m) => ({ default: m.LaserVariants })),
);

/**
 * LaserBackground
 * Renders the Vanishing Array variant as a fixed full-viewport WebGL background.
 * Configured to exactly match the usage spec:
 *   variant="vanishing-array" speed=1 size=1 length=1 density=1 opacity=1 hue=0 saturation=1 brightness=1
 */
export function LaserBackground() {
  return (
    <div className="arovia-laser-bg" aria-hidden="true">
      <Suspense fallback={<div style={{ background: "#020305", position: "absolute", inset: 0 }} />}>
        <LaserVariants
          variant="vanishing-array"
          speed={1.0}
          size={1.0}
          length={1.0}
          density={1.0}
          opacity={1.0}
          hue={0}
          saturation={1.0}
          brightness={1.0}
        />
      </Suspense>
    </div>
  );
}
