"use client";

import { useEffect } from "react";
import { getLenis } from "@/lib/lenis";

/**
 * Scrolls to the URL hash on mount and on subsequent hash changes.
 *
 * Needed because a native hash jump lands instantly and ignores the fixed
 * header, and because Lenis owns the scroll position — letting the browser jump
 * would leave Lenis out of sync. Renders nothing.
 */
export default function HashScroll({ offset = -110 }) {
  useEffect(() => {
    const scrollToHash = () => {
      const { hash } = window.location;
      if (!hash || hash.length < 2) return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset, duration: 1.2 });
      else target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // A beat after mount so fonts and images have settled and the target's
    // position is final — measuring too early lands short.
    const timer = setTimeout(scrollToHash, 180);
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [offset]);

  return null;
}
