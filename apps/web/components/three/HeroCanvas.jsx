"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// The 3D bundle is lazy-loaded client-side only. Visitors who prefer reduced
// motion get a still, low-cost stand-in instead of a spinning canvas.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-full bg-surface/60" />,
});

export default function HeroCanvas({ accent }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div
          className="aspect-square w-2/3 rounded-full border-2"
          style={{ borderColor: accent, opacity: 0.35 }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <HeroScene accent={accent} />
    </div>
  );
}
