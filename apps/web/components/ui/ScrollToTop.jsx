"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getLenis } from "@/lib/lenis";

const SHOW_AFTER = 400; // px scrolled before it appears
const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Fixed scroll-to-top control with a ring showing how far down the page you
 * are. Appears once you've scrolled past SHOW_AFTER.
 *
 * The ring is driven by an explicit stroke-dashoffset rather than Framer's
 * `pathLength`, so it doesn't depend on browser support for the pathLength
 * attribute.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();

  const dashOffset = useTransform(scrollYProgress, (p) => CIRCUMFERENCE * (1 - p));

  useEffect(() => {
    // Set once on mount too, so a restored scroll position shows the button
    // without waiting for the first scroll event.
    setVisible(scrollY.get() > SHOW_AFTER);
    return scrollY.on("change", (v) => setVisible(v > SHOW_AFTER));
  }, [scrollY]);

  function handleClick() {
    const lenis = getLenis();
    if (lenis) {
      // Drive Lenis directly — window.scrollTo would fight the smooth-scroll
      // layer and produce a stutter.
      lenis.scrollTo(0, { duration: reducedMotion ? 0 : 1.2 });
      return;
    }
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Scroll back to top"
          data-cursor="hover"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="group fixed bottom-6 right-6 z-[70] grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-lg sm:bottom-8 sm:right-8"
        >
          {/* Progress ring, inset slightly so it reads as a track around the
              button rather than part of its edge. */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r={RADIUS} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <motion.circle
              cx="24"
              cy="24"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>

          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="relative transition-transform duration-300 group-hover:-translate-y-0.5"
            aria-hidden="true"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
