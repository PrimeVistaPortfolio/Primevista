"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Client logo strip that drifts continuously and **accelerates with scroll
 * velocity** — scroll faster and the logos rush past; scroll upward and the
 * strip reverses direction.
 *
 * The track holds two identical copies and `wrap(-50, 0, x)` loops the
 * translation between them, so the belt is seamless in both directions.
 */
function LogoRow({ clients, ariaHidden }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {clients.map((client) => (
        <div key={`${client._id}-${ariaHidden ? "b" : "a"}`} className="flex items-center">
          <div className="flex h-12 w-[clamp(7rem,12vw,11rem)] items-center justify-center px-4">
            {client.logo?.url ? (
              <Image
                src={client.logo.url}
                alt={client.logo.alt || client.name}
                width={160}
                height={48}
                className="h-full w-auto max-w-full object-contain opacity-60 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span className="whitespace-nowrap text-lg text-ink">{client.name}</span>
            )}
          </div>
          <span className="select-none text-accent" aria-hidden="true">
            ✳
          </span>
        </div>
      ))}
    </div>
  );
}

// baseVelocity is the idle drift in % of one row per second — scroll velocity
// multiplies it on top (see the frame loop below).
export default function ClientMarquee({ clients, title = "Trusted by", baseVelocity = 4 }) {
  const baseX = useMotionValue(0);
  const directionFactor = useRef(1);
  const reducedMotion = useReducedMotion();

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // clamp:false lets fast scrolling push well past the mapped range.
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 6], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;

    // A tab regaining focus can hand us a very large delta; cap it so the belt
    // doesn't lurch across several copies in one frame.
    const step = Math.min(delta, 50) / 1000;
    let moveBy = directionFactor.current * baseVelocity * step;

    const factor = velocityFactor.get();

    // Scrolling up flips the belt; scrolling down drives it forward.
    if (factor < 0) directionFactor.current = -1;
    else if (factor > 0) directionFactor.current = 1;

    // Bound the multiplier: clamp:false above lets a hard fling produce a huge
    // value, which would teleport the belt rather than accelerate it.
    moveBy += moveBy * Math.max(-10, Math.min(10, factor));

    const next = baseX.get() + moveBy;
    if (Number.isFinite(next)) baseX.set(next);
  });

  if (!clients?.length) return null;

  return (
    <section className=" overflow-hidden py-20 sm:py-16">
      <div className="mx-auto mb-12 flex max-w-container items-center justify-between gap-6 px-6">
        <p className="label">{title}</p>
        <p className="label">{String(clients.length).padStart(2, "0")} partners</p>
      </div>

      {/* w-max is load-bearing: a block-level flex container is 100% of its
          parent, so -50% would translate half the *section* rather than one
          copy of the row, and the loop would drift until the belt left the
          screen. Sizing to content makes -50% exactly one copy. */}
      <motion.div className="flex w-max whitespace-nowrap" style={reducedMotion ? undefined : { x }}>
        <LogoRow clients={clients} />
        <LogoRow clients={clients} ariaHidden />
      </motion.div>
    </section>
  );
}
