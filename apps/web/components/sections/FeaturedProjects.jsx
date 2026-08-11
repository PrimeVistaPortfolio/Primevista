"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeader from "@/components/ui/SectionHeader";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Pinned horizontal showcase: the section sticks while the track translates
 * sideways, so vertical scrolling drives horizontal movement. Falls back to a
 * normal swipeable row on touch/narrow screens and under reduced motion.
 */
export default function FeaturedProjects({ projects, index = 2 }) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !trackRef.current) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    let ctx;
    let cancelled = false;
    let cleanupWatchers = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      // The effect can be torn down while those dynamic imports are still in
      // flight — StrictMode's dev double-mount does exactly that, and so does
      // any HMR edit. The cleanup below then runs before `ctx` is assigned, so
      // `ctx?.revert()` silently no-ops and this ScrollTrigger outlives its
      // effect. The remount creates a second one on the same section, and two
      // triggers pinning one element is what makes the whole section vanish on
      // scroll: each installs its own pin-spacer and fights over the element's
      // `position: fixed` coordinates. Harmless while `pin` was false (the two
      // scrubs just doubled up on `x`), fatal the moment pinning is on.
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Measured lazily via functions so `invalidateOnRefresh` recomputes
        // them on resize instead of reusing a stale closure value.
        const distance = () => Math.max(10, trackRef.current.scrollWidth - window.innerWidth+50);
        if (distance() <= 0) return;
        // Pinning an element taller than the viewport is what causes the next
        // section to scroll up underneath it. Bail out rather than overlap —
        // the track still scrolls horizontally by hand.
        if (sectionRef.current.offsetHeight > window.innerHeight + 2) return;

        const tween = gsap.to(trackRef.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `10+=${distance()}`,
            pin: true,
            pinSpacing: true,
            scrub: 1,
            invalidateOnRefresh: true,
            // Deliberately no anticipatePin. It engages the pin early based on
            // scroll velocity, but only in the direction of travel — so
            // scrolling down froze the section while its top was still below
            // the viewport top (it "stopped at the bottom"), while scrolling
            // up pinned correctly. That asymmetry is the tell.
          },
        });

        const st = tween.scrollTrigger;

        // Safety net for layout shifts (fonts swapping, etc.), NOT for image
        // loads — card size is fixed by aspect-[4/3] + explicit width, so
        // decoding an image never changes trackRef's scrollWidth. Refreshing
        // per-image used to fire mid-scrub (thumbnails 3/4 sit off-screen at
        // mount, so their `load` event only fires once the tween drags them
        // into view), which recalculated the pin's start/end while the user
        // was still scrolling — that's what caused the section to jump or
        // re-pin partway through. Guarding on isActive means this can now
        // only ever run before the user has entered the pin or after they've
        // fully left it.
        const refresh = () => {
          if (st.isActive) return;
          ScrollTrigger.refresh();
        };

        window.addEventListener("load", refresh);
        const settle = setTimeout(refresh, 400);

        cleanupWatchers = () => {
          clearTimeout(settle);
          window.removeEventListener("load", refresh);
        };
      }, sectionRef);
    })();

    return () => {
      cancelled = true;
      cleanupWatchers();
      ctx?.revert();
    };
  }, [reducedMotion, projects?.length]);

  if (!projects?.length) return null;

  return (
    // A pinned section must fit the viewport exactly — anything taller is
    // frozen off-screen and unreachable, which is why this was showing only
    // partially. On large screens it is exactly 100vh and its contents are
    // centred; below the pin breakpoint it flows normally.
    <section
      ref={sectionRef}
      className="overflow-hidden py-28 sm:py-16  lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0 "
    >
      <div className="mx-auto w-full max-w-container px-6">
        <SectionHeader
          index={index}
          label="Selected work"
          title="Things we've"
          titleAccent="shipped."
          link={{ href: "/projects", label: "All projects →" }}
          // This header is inside the pinned section, so its reveal triggers
          // need to know that or they never fire and it renders invisible.
          pinnedContainer={sectionRef}
        />

        <div className="mt-10 flex items-center justify-between border-t border-rule pt-4 lg:mt-8">
          <span className="label">
            01 / {String(projects.length).padStart(2, "0")}
          </span>
          <span className="label flex items-center gap-2">
            Scroll
            <span className="inline-block transition-transform">→</span>
          </span>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-20 flex snap-x snap-mandatory gap-6 overflow-x-auto px-10 pb-4 lg:mt-10 lg:snap-none lg:overflow-visible lg:pl-6 lg:pr-[20vw]"
      >
        {projects.map((project, i) => (
          <Link
            key={project._id}
            href={`/projects/${project.slug}`}
            data-cursor="hover"
            // Sized in vh once pinned: a vw-based width overflows a wide but
            // short viewport, which would reintroduce the clipping.
            className="group w-[82vw] shrink-0 snap-center sm:w-[58vw] lg:w-[58vh]"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface">
              {project.coverImage?.url && (
                <Image
                  src={project.coverImage.url}
                  alt={project.coverImage.alt || project.title}
                  fill
                  sizes="(max-width: 1024px) 82vw, 40vw"
                  // Eager, not lazy: these four thumbnails sit in a
                  // horizontally-scrolling track, so cards 3/4 are still
                  // "off-screen" at mount as far as IntersectionObserver is
                  // concerned even though they're already laid out and about
                  // to be scrolled into view by the GSAP tween. Lazy-loading
                  // them meant they only started fetching once the tween
                  // dragged them into view — see the refresh() comment above
                  // for why that broke the pin.
                  loading="eager"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              )}
              <span className="label absolute left-4 top-4 text-ink">{String(i + 1).padStart(3, "0")}</span>
            </div>

            <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-rule pt-4">
              <h3 className="text-xl text-ink transition-colors group-hover:text-accent">{project.title}</h3>
              <span className="label shrink-0">
                {[project.tags?.[0], project.client].filter(Boolean).join(" ✳ ")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}