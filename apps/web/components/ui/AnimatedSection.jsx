"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Wraps children in a GSAP ScrollTrigger fade/slide-in reveal.
 * `as` lets the caller pick the wrapping element; `y`/`delay` tune the effect.
 */
export default function AnimatedSection({
  children,
  as: Tag = "div",
  className = "",
  y = 40,
  delay = 0,
  // Pass the pinned ancestor (a ref) when this sits inside a pinned section,
  // or the trigger measures against the wrong coordinates, never fires, and
  // the content stays at opacity 0.
  pinnedContainer,
  ...rest
}) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !ref.current) return;

    let ctx;
    let cancelled = false;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      // Torn down mid-import (StrictMode's double-mount, HMR): the cleanup ran
      // before `ctx` existed, so reverting no-opped and this trigger leaked.
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 85%",
              pinnedContainer: pinnedContainer?.current || undefined,
            },
          }
        );
      }, ref);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reducedMotion, y, delay, pinnedContainer]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
