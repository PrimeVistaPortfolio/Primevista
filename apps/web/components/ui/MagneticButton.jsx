"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Button/link that leans toward the cursor while hovered and springs back on
 * exit. A hover-state micro-interaction — the kind of motion a scroll library
 * can't give you.
 */
export default function MagneticButton({
  href,
  children,
  className = "",
  strength = 0.35,
  onClick,
  type,
  disabled,
}) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  // The label trails the container slightly, which sells the "pull" effect.
  const labelX = useTransform(springX, (v) => v * 0.35);
  const labelY = useTransform(springY, (v) => v * 0.35);

  function handleMove(e) {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const inner = (
    <motion.span style={reducedMotion ? undefined : { x: labelX, y: labelY }} className="pointer-events-none block">
      {children}
    </motion.span>
  );

  const motionProps = {
    ref,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    style: reducedMotion ? undefined : { x: springX, y: springY },
    className,
    "data-cursor": "hover",
  };

  if (href) {
    return (
      <motion.div {...motionProps} className="inline-block">
        <Link href={href} className={className} data-cursor="hover">
          {inner}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button {...motionProps} type={type} onClick={onClick} disabled={disabled}>
      {inner}
    </motion.button>
  );
}
