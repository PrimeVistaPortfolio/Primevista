"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Scrubbed parallax — the element drifts at a different rate than the page as
 * it passes through the viewport. Unlike a reveal, this stays tied to scroll
 * position the whole way through (scrub: true).
 */
export default function Parallax({ children, className = "", speed = 12, as: Tag = "div" }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    let ctx;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { yPercent: speed },
          {
            yPercent: -speed,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }, ref);
    })();

    return () => ctx?.revert();
  }, [reducedMotion, speed]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
