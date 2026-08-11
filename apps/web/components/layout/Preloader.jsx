"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";

// ── Timeline (seconds) ──────────────────────────────────────────────────────
// The frame builds itself first — border draws, corners snap in — and only
// then does the wordmark rise into it.
// One edge at a time, each handing off exactly as the previous finishes, so it
// reads as a single line travelling around the frame.
const BOX_SEGMENT = 0.175;
const BOX_DURATION = BOX_SEGMENT * 4; // 0.7
const CORNERS_START = 0.45;
const CORNER_STEP = 0.08;
const NAME_START = BOX_DURATION; // the name rises exactly as the frame closes
const NAME_DURATION = 0.9;

const COUNT_START = 0.95;
const COUNT_DURATION = 1.6;
const TAGLINE_START = 1.3;
const TAGLINE_STEP = 0.25;
const EXIT_AT = COUNT_START + COUNT_DURATION + 0.3; // just after the counter lands

// Exit: the panel scales up first, then dissolves. Offsetting the fade means
// the growth is legible before the opacity carries it away.
const EXIT_SCALE_DURATION = 1.1;
const EXIT_FADE_DELAY = 0.5;
const EXIT_FADE_DURATION = 1;
const DONE_AT =
  EXIT_AT + Math.max(EXIT_SCALE_DURATION, EXIT_FADE_DELAY + EXIT_FADE_DURATION) + 0.15;

const TAGLINE = ["Inspire", "Innovate", "Impact"];

/** Small crosshair that straddles a corner of the frame, snapping in once the
 *  border has finished drawing. */
function CornerPlus({ className, index = 0 }) {
  return (
    <motion.span
      className={`absolute z-10 block h-[13px] w-[13px] ${className}`}
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: CORNERS_START + index * CORNER_STEP,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <line x1="6.5" y1="0" x2="6.5" y2="13" stroke="currentColor" />
        <line x1="13" y1="6.5" x2="0" y2="6.5" stroke="currentColor" />
      </svg>
    </motion.span>
  );
}

/**
 * One odometer reel. `divisor` sets how fast this place turns: the ones column
 * advances once per unit, tens once per ten, hundreds once per hundred — which
 * is what makes the columns spin at different speeds like a real counter.
 */
function Reel({ progress, divisor, steps }) {
  const y = useTransform(progress, (v) => `${-(v / divisor)}rem`);

  return (
    <span className="pv-reel">
      <motion.span className="block" style={{ y }}>
        {Array.from({ length: steps + 1 }).map((_, i) => (
          <span key={i} className="pv-digit text-ink-muted">
            {i % 10}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/**
 * Intro sequence: a framed wordmark with corner crosshairs, a tagline that
 * reveals word by word, and a 000→100 odometer. On completion the whole panel
 * scales up and then fades out, handing over to the page beneath.
 *
 * Plays on every full page load (including reloads) but not on in-app
 * navigation; skipped entirely under prefers-reduced-motion.
 */
export default function Preloader({ siteName = "PrimeVista" }) {
  const [stage, setStage] = useState("hidden"); // hidden | intro | exit
  const [words, setWords] = useState(0);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // No session guard: the root layout doesn't remount on client-side
    // navigation, so this effect already only runs on a full page load. That
    // means the intro plays on every load/reload but never when moving between
    // pages in-app — which is the behaviour we want.
    setStage("intro");
    document.body.style.overflow = "hidden";

    const controls = animate(progress, 100, {
      duration: COUNT_DURATION,
      delay: COUNT_START,
      ease: [0.16, 1, 0.3, 1],
    });

    const timers = [
      ...TAGLINE.map((_, i) =>
        setTimeout(() => setWords((n) => Math.max(n, i + 1)), (TAGLINE_START + i * TAGLINE_STEP) * 1000)
      ),
      setTimeout(() => setStage("exit"), EXIT_AT * 1000),
      setTimeout(() => {
        setStage("hidden");
        document.body.style.overflow = "";
      }, DONE_AT * 1000),
    ];

    return () => {
      controls.stop();
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, [progress]);

  const exiting = stage === "exit";

  return (
    <AnimatePresence>
      {stage !== "hidden" && (
        <motion.div
          key="preloader"
          animate={{ scale: exiting ? 1.28 : 1, opacity: exiting ? 0 : 1 }}
          transition={{
            scale: { duration: EXIT_SCALE_DURATION, ease: [0.76, 0, 0.24, 1] },
            opacity: {
              duration: EXIT_FADE_DURATION,
              delay: EXIT_FADE_DELAY,
              ease: "easeInOut",
            },
          }}
          className="theme-dark pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-background px-6"
        >
          <div className="relative h-[clamp(10rem,22vw,17.5rem)] w-[clamp(10rem,22vw,27.5rem)]">
            {/* Four edges drawn in sequence rather than an SVG pathLength:
                pathLength on <rect> is unevenly supported, and a stretched
                viewBox would make the draw speed differ between axes. Scaling
                1px edges is exact at any aspect ratio. Linear easing plus a
                delay equal to the segment length makes the corners seamless. */}
            <div className="absolute inset-0" aria-hidden="true">
              {[
                { cls: "left-0 top-0 h-px w-full origin-left", axis: "scaleX" },
                { cls: "right-0 top-0 h-full w-px origin-top", axis: "scaleY" },
                { cls: "bottom-0 right-0 h-px w-full origin-right", axis: "scaleX" },
                { cls: "bottom-0 left-0 h-full w-px origin-bottom", axis: "scaleY" },
              ].map((edge, i) => (
                <motion.span
                  key={i}
                  className={`absolute block bg-rule ${edge.cls}`}
                  initial={{ [edge.axis]: 0 }}
                  animate={{ [edge.axis]: 1 }}
                  transition={{ duration: BOX_SEGMENT, delay: i * BOX_SEGMENT, ease: "linear" }}
                />
              ))}
            </div>

            <span className="text-ink-faint">
              <CornerPlus className="-left-[12.5px] -top-[12.5px]" index={0} />
              <CornerPlus className="-right-[12.5px] -top-[12.5px]" index={1} />
              <CornerPlus className="-bottom-[12.5px] -right-[12.5px]" index={2} />
              <CornerPlus className="-bottom-[12.5px] -left-[12.5px]" index={3} />
            </span>

            <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-4">
              <span className="split-line">
                <motion.span
                  className="split-word display text-center text-[clamp(1.5rem,3.4vw,2.75rem)] text-ink"
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: NAME_DURATION,
                    delay: NAME_START,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {siteName}
                </motion.span>
              </span>
            </div>
          </div>

          {/* Tagline words appear one at a time, dots between them. */}
          <div className="mt-10 flex items-center">
            {TAGLINE.map((word, i) => (
              <span key={word} className="flex items-center">
                {i > 0 && (
                  <span
                    className="mx-2 text-ink-faint transition-opacity duration-500"
                    style={{ opacity: words > i ? 1 : 0 }}
                    aria-hidden="true"
                  >
                    ·
                  </span>
                )}
                <span
                  className="label !text-ink transition-all duration-500 ease-out"
                  style={{
                    opacity: words > i ? 1 : 0,
                    transform: words > i ? "translateY(0)" : "translateY(6px)",
                  }}
                >
                  {word}
                </span>
              </span>
            ))}
          </div>

          {/* Odometer, pinned near the bottom edge. */}
          <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-px">
            <Reel progress={progress} divisor={100} steps={1} />
            <Reel progress={progress} divisor={10} steps={10} />
            <Reel progress={progress} divisor={1} steps={100} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
