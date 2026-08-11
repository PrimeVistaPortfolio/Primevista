"use client";

import { useEffect, useMemo, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Masked word reveal: each word sits in an overflow-hidden wrapper and slides
 * up from below the mask, staggered. Reads as typographic craft rather than the
 * generic whole-block fade that every scroll library ships with.
 *
 * Renders plain, fully-visible text when the visitor prefers reduced motion —
 * and always renders the real text in the DOM, so it stays selectable and
 * crawlable for SEO.
 */
export default function SplitText({
  children,
  as: Tag = "span",
  className = "",
  delay = 0,
  stagger = 0.045,
  duration = 1,
  start = "top 88%",
  once = true,
  // Pass the pinned ancestor (a ref) when this sits inside a pinned section.
  // Without it ScrollTrigger measures against the wrong coordinates, the
  // trigger never fires, and the words stay hidden behind their masks.
  pinnedContainer,
}) {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();

  const words = useMemo(() => String(children ?? "").split(/(\s+)/), [children]);

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
          ref.current.querySelectorAll(".split-word"),
          { yPercent: 115, rotate: 3 },
          {
            yPercent: 0,
            rotate: 0,
            duration,
            delay,
            stagger,
            ease: "expo.out",
            scrollTrigger: {
              trigger: ref.current,
              start,
              once,
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
  }, [reducedMotion, delay, stagger, duration, start, once, pinnedContainer]);

  if (reducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) =>
        /^\s+$/.test(word) ? (
          " "
        ) : (
          <span key={i} className="split-line">
            <span className="split-word">{word}</span>
          </span>
        )
      )}
    </Tag>
  );
}
