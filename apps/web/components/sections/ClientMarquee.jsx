"use client";

import { useEffect, useRef, useState } from "react";
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
 * The track holds N identical copies and `wrap(-100 / N, 0, x)` loops the
 * translation by exactly one copy, so the belt is seamless in both directions.
 */
function LogoRow({ clients, ariaHidden, copy = "a", innerRef }) {
  return (
    <div
      ref={innerRef}
      className="flex shrink-0 items-center"
      aria-hidden={ariaHidden || undefined}
    >
      {clients.map((client) => (
        <div key={`${client._id}-${copy}`} className="flex items-center">
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
              <span className="whitespace-nowrap text-lg text-gray-500 font-semibold">{client.name}</span>
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

// baseVelocity is the idle drift in % of *one copy* per second — scroll
// velocity multiplies it on top (see the frame loop below).
export default function ClientMarquee({ clients, title = "Trusted by", baseVelocity = 8 }) {
  const baseX = useMotionValue(0);
  const directionFactor = useRef(1);
  const reducedMotion = useReducedMotion();

  // One copy of the row is usually narrower than the viewport, so two copies
  // aren't enough: the belt runs out of logos before it can wrap and a gap
  // opens after the last one. Measure the row and repeat it enough times to
  // cover the viewport twice over.
  const rowRef = useRef(null);
  const [repeats, setRepeats] = useState(2);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const rowWidth = row.offsetWidth;
      if (!rowWidth) return;
      // +1 so a full copy is always queued up off-screen behind the wrap point.
      const needed = Math.ceil(window.innerWidth / rowWidth) + 1;
      setRepeats(Math.max(2, needed));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [clients]);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  // clamp:false lets fast scrolling push well past the mapped range.
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 6], { clamp: false });

  // The track is `repeats` copies wide, so one copy is 100 / repeats percent
  // of it — that's both the wrap distance and the unit the drift moves in.
  const copySpan = 100 / repeats;
  const x = useTransform(baseX, (v) => `${wrap(-copySpan, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return;

    // A tab regaining focus can hand us a very large delta; cap it so the belt
    // doesn't lurch across several copies in one frame.
    const step = Math.min(delta, 50) / 1000;
    // baseVelocity is copies-per-second, so scale it into track percent.
    let moveBy = (directionFactor.current * baseVelocity * copySpan * step) / 100;

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
          parent, so the wrap offset would be measured against the *section*
          rather than the track, and the loop would drift until the belt left
          the screen. Sizing to content makes 100 / repeats exactly one copy. */}
      <motion.div className="flex w-max whitespace-nowrap" style={reducedMotion ? undefined : { x }}>
        {Array.from({ length: repeats }, (_, i) => (
          <LogoRow
            key={i}
            clients={clients}
            copy={i}
            ariaHidden={i > 0}
            innerRef={i === 0 ? rowRef : undefined}
          />
        ))}
      </motion.div>
    </section>
  );
}
