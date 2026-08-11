"use client";

/**
 * Infinite marquee band. The track holds two identical copies of the content
 * and translates -50%, so the loop is seamless. Pure CSS animation — it keeps
 * running cheaply off the main thread and stops under prefers-reduced-motion.
 */
const GLYPHS = ["❋", "❊", "❈", "✢"];

export default function Marquee({ text, repeat = 6, duration = 40, className = "" }) {
  const items = Array.from({ length: repeat });

  const run = (key) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={key === "b" ? "true" : undefined}>
      {items.map((_, i) => (
        <span key={i} className="flex items-center">
          <span className="display whitespace-nowrap px-6 text-[clamp(2rem,5vw,4rem)] uppercase tracking-tight">
            {text}
          </span>
          <span className="text-accent text-2xl">{GLYPHS[i % GLYPHS.length]}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track" style={{ "--marquee-duration": `${duration}s` }}>
        {run("a")}
        {run("b")}
      </div>
    </div>
  );
}
