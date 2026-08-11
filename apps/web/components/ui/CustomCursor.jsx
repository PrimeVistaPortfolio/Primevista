"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { themeOfElement } from "@/lib/themeAtElement";

/**
 * Dot + trailing ring cursor.
 *
 * The cursor lives at the document root, so it can't inherit colours from the
 * section it happens to be floating over. Instead it reads the theme of the
 * element under the pointer and inverts against it: light ink over a dark
 * section, dark ink over a light one.
 *
 * Fine-pointer devices only, and never under prefers-reduced-motion (hiding the
 * system cursor is an accessibility problem, so it's restored in both cases).
 */
export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [theme, setTheme] = useState("dark");

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.5 });

  useEffect(() => {
    if (reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    setEnabled(true);
    document.documentElement.classList.add("has-custom-cursor");

    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);

      const target = e.target;
      setHovering(!!target?.closest?.('a, button, input, textarea, select, [data-cursor="hover"]'));
      // Nearest themed ancestor decides the contrast the cursor needs.
      setTheme(themeOfElement(target));
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, [reducedMotion, x, y]);

  if (!enabled) return null;

  // Explicit hexes rather than tokens: the cursor is outside every themed
  // subtree, so `var(--color-ink)` would always resolve to the root theme.
  const color = theme === "light" ? "#17181b" : "#dbdcdc";

  return (
    <>
      <motion.div
        aria-hidden="true"
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{ backgroundColor: color, scale: hovering ? 0 : 1 }}
          transition={{ duration: 0.25 }}
          className="h-1.5 w-1.5 rounded-full"
        />
      </motion.div>

      <motion.div
        aria-hidden="true"
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[95] -translate-x-1/2 -translate-y-1/2"
      >
        <motion.div
          animate={{
            borderColor: color,
            scale: hovering ? 2.1 : 1,
            opacity: hovering ? 0.85 : 0.4,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="h-9 w-9 rounded-full border"
        />
      </motion.div>
    </>
  );
}
