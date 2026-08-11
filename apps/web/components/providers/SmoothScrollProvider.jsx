"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setLenis } from "@/lib/lenis";

// Buttery smooth scrolling via Lenis, wired into GSAP's ticker so
// ScrollTrigger stays in sync. Skipped entirely under prefers-reduced-motion.
export default function SmoothScrollProvider({ children }) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    let lenis;
    let rafId;
    let cleanupGsap = () => {};

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      // Expose it so components outside this tree can drive scrolling.
      setLenis(lenis);

      const tick = (time) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      cleanupGsap = () => gsap.ticker.remove(tick);
    })();

    return () => {
      cleanupGsap();
      setLenis(null);
      lenis?.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  return children;
}
