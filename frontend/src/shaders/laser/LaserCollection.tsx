import { lazy, Suspense } from "react";

import type { LaserVariantsProps, ThreeUILaserVariant } from "./LaserVariants";

export type LaserVariant = ThreeUILaserVariant;

export type LaserCollectionProps = {
  variant?: LaserVariant;
  speed?: number;
  size?: number;
  length?: number;
  density?: number;
  opacity?: number;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: React.CSSProperties;
};

const ThreeUILaserVariantRenderer = lazy(() =>
  import("./LaserVariants").then((module) => ({ default: module.LaserVariants })),
);

const FALLBACK = <div className="threeui-background laser-variant" />;

export function LaserCollection({ variant = "vanishing-array", ...props }: LaserCollectionProps) {
  const laserProps = props as LaserVariantsProps;
  return (
    <Suspense fallback={FALLBACK}>
      <ThreeUILaserVariantRenderer {...laserProps} variant={variant} />
    </Suspense>
  );
}
