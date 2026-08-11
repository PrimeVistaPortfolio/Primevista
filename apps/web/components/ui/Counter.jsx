"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Counts up when scrolled into view. `pad` zero-pads the result (040, 092) —
 * the leading zero is a deliberate editorial device, not a bug.
 */
export default function Counter({ value, pad = 3, prefix = "", suffix = "", duration = 1600, className = "" }) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }
    const node = ref.current;
    if (!node) return;

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const start = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutExpo — fast start, long settle
          const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          setDisplay(Math.round(eased * value));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {String(display).padStart(pad, "")}
      {suffix}
    </span>
  );
}
