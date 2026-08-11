"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Full-bleed looping video behind a section.
 *
 * Sits absolutely inside a `relative` section, under content that carries
 * `relative z-10`. Two things keep the type readable over it: a scrim painted
 * in the section's own `--color-background`, so it darkens on a dark band and
 * lightens on a light one without being told which it is; and the video's own
 * opacity, which pushes it further back.
 *
 * Decorative only — `aria-hidden`, no pointer events, and never the carrier of
 * anything a visitor needs.
 */
export default function SectionVideo({ src, url, poster, scrim = 0.62, opacity = 1, className = "" }) {
  // `url` is what an uploaded media object carries, `src` reads naturally when
  // an editor types the field by hand. Accept either, and let `poster` be a
  // plain URL or a media object.
  const source = src || url;
  const posterProp = typeof poster === "string" ? poster : poster?.url;
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [canPlay, setCanPlay] = useState(false);

  // Only decode while on screen. A muted background video the visitor scrolled
  // past keeps a core busy and drains laptop battery for nothing.
  useEffect(() => {
    const container = containerRef.current;
    if (reducedMotion || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (!source) return null;

  // Cloudinary serves a still of any frame by swapping the extension, so a
  // poster costs nothing when the editor didn't supply one.
  const posterUrl =
    posterProp ||
    (source.includes("/video/upload/") ? source.replace(/\.(mp4|webm|mov)$/i, ".jpg") : undefined);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
    >
      {reducedMotion ? (
        // Stillness is the whole point of the preference — show the frame, not
        // a looping clip the visitor asked the platform not to give them.
        posterUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={posterUrl} alt="" className="h-full w-full object-cover" style={{ opacity }} />
        )
      ) : (
        <video
          ref={videoRef}
          poster={posterUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setCanPlay(true)}
          // Fade in on first frame so the poster doesn't visibly swap.
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            canPlay ? "" : "opacity-0"
          }`}
          style={{ opacity: canPlay ? opacity : 0 }}
        >
          <source src={source} type={source.endsWith(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      )}

      {/* Scrim in the section's own background colour — theme-agnostic. */}
      <div className="absolute inset-0 bg-background" style={{ opacity: scrim }} />
    </div>
  );
}
