"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Same contract as HeroCanvas: the 3D bundle is client-only and lazy, and
// visitors who prefer reduced motion get a still stand-in instead of a
// rotating globe.
const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-full bg-surface/60" />,
});

const FALLBACK_ACCENT = "#3B82F6";

/**
 * @param {"dark"|"light"} theme  Ground the globe is sitting on, from the
 *   region's resolved theme in Site Settings. A WebGL canvas can't inherit the
 *   CSS colour tokens, so the scene keeps its own palette per theme — light
 *   dots on the dark ground, dark dots on the pale one.
 */
export default function GlobeCanvas({ accent, theme = "dark" }) {
  const reducedMotion = useReducedMotion();
  const accentColor = accent || FALLBACK_ACCENT;

  if (reducedMotion) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative aspect-square w-2/3 rounded-full border-2"
          style={{ borderColor: accentColor, opacity: 0.35 }}
          aria-hidden="true"
        >
          {/* Two meridians, so the static fallback still reads as a globe. */}
          <span
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
            style={{ backgroundColor: accentColor }}
          />
          <span
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <GlobeScene accent={accentColor} theme={theme} />
    </div>
  );
}
