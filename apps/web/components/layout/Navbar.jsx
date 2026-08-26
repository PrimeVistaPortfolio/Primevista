"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { categoryId } from "@/lib/slug";
import { getLenis } from "@/lib/lenis";
import { themeAtPoint } from "@/lib/themeAtElement";

const LINKS = [
  { href: "/projects", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Clears the fixed header so an anchored section isn't hidden beneath it.
const ANCHOR_OFFSET = -110;

export default function Navbar({ settings, categories = [] }) {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Theme of whatever is scrolling under the bar. Null until the first probe,
  // during which the bar keeps the theme it was server-rendered with.
  const [underTheme, setUnderTheme] = useState(null);
  const closeTimer = useRef(null);
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const pathname = usePathname();
  const logo = settings?.logoDark?.url || settings?.logoLight?.url;

  // Hide on scroll down, reveal on scroll up — keeps the type-heavy pages clear.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Invert the bar against the section behind it.
   *
   * On a page that mixes light and dark bands a fixed bar goes unreadable the
   * moment a band of its own colour scrolls underneath. Probing at the bar's
   * own height rather than its live position keeps the reading steady while it
   * animates in and out on scroll.
   */
  useEffect(() => {
    let frame = 0;

    const probe = () => {
      frame = 0;
      const header = headerRef.current;
      const nav = navRef.current;
      if (!header || !nav) return;

      const theme = themeAtPoint(window.innerWidth / 2, nav.offsetHeight + 2, header);
      if (theme) setUnderTheme(theme);
    };

    // One read per frame: elementsFromPoint forces layout, and scroll fires far
    // more often than the bar can visibly change.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    probe();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  // A small grace period so moving the pointer from the trigger into the panel
  // doesn't close it in the gap between them.
  function openMenuNow() {
    clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }
  function closeMenuSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenuOpen(false), 160);
  }

  /**
   * When we're already on /services a hash link would make the browser jump
   * instantly, and Lenis would then animate from wherever it landed. Scrolling
   * manually keeps it smooth; cross-page clicks fall through to the Link and
   * are handled by <HashScroll> once the page mounts.
   */
  function handleCategoryClick(event, id) {
    if (pathname !== "/services") return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { offset: ANCHOR_OFFSET, duration: 1.2 });
    else target.scrollIntoView({ behavior: "smooth", block: "start" });

    window.history.replaceState(null, "", `#${id}`);
    setMenuOpen(false);
  }

  return (
    <>
      <motion.header
        ref={headerRef}
        animate={{ y: hidden && !open && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        // The theme class re-points the colour tokens, so the logo, links,
        // numerals and hairline all flip without knowing anything about it.
        // `!bg-transparent` cancels the opaque background that class carries —
        // the bar is meant to stay see-through so its blur still reads.
        className={`fixed inset-x-0 top-0 z-[80] bg-background/80 backdrop-blur-md ${
          underTheme ? `theme-${underTheme} !bg-transparent` : ""
        }`}
      >
        <nav
          ref={navRef}
          className="mx-auto flex max-w-container items-center justify-between border-b border-rule px-6 py-5"
        >
          <Link href="/" className="flex items-center gap-3 text-ink " data-cursor="hover">
            {logo ? (
              <Image src={logo} alt={settings?.siteName || "Home"} width={32} height={32} className="w-28 object-contain" />
            ) : (
              <span className="display text-xl tracking-tight">{settings?.siteName || "OMIXINFOSOFT"}</span>
            )}
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {LINKS.map((link, i) => {
              const active = pathname.startsWith(link.href);
              const hasMenu = link.href === "/services" && categories.length > 0;

              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={hasMenu ? openMenuNow : undefined}
                  onMouseLeave={hasMenu ? closeMenuSoon : undefined}
                >
                  <Link
                    href={link.href}
                    data-cursor="hover"
                    aria-haspopup={hasMenu ? "true" : undefined}
                    aria-expanded={hasMenu ? menuOpen : undefined}
                    onFocus={hasMenu ? openMenuNow : undefined}
                    className={`link-underline flex items-center text-sm transition-colors ${
                      active ? "text-ink" : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    <span className="label mr-2 text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    {link.label}
                    {hasMenu && (
                      <motion.span
                        animate={{ rotate: menuOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-1.5 text-[0.6rem] leading-none"
                        aria-hidden="true"
                      >
                        ▾
                      </motion.span>
                    )}
                  </Link>

                  {hasMenu && (
                    <AnimatePresence>
                      {menuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          // pt-4 bridges the gap to the trigger so the pointer
                          // never leaves the hover area on the way down.
                          className="absolute left-1/2 top-full z-10 w-64 -translate-x-1/2 pt-4"
                        >
                          {/* theme-light re-themes the whole panel by
                              redefining the colour tokens, so the border, text,
                              hover fill and label all flip with it — and the
                              custom cursor darkens over it automatically. */}
                          <div className="theme-light overflow-hidden rounded-xl border border-rule bg-background p-2 shadow-2xl">
                            <p className="label px-3 pb-2 pt-1">Categories</p>

                            {categories.map((category, ci) => (
                              <motion.div
                                key={category}
                                initial={{ opacity: 0, x: -6 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.03 * ci, duration: 0.25 }}
                              >
                                <Link
                                  href={`/services#${categoryId(category)}`}
                                  data-cursor="hover"
                                  onClick={(e) => handleCategoryClick(e, categoryId(category))}
                                  className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                                >
                                  {category}
                                  <span className="text-ink-faint opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100">
                                    →
                                  </span>
                                </Link>
                              </motion.div>
                            ))}

                            <Link
                              href="/services"
                              data-cursor="hover"
                              className="mt-1 block border-t border-rule px-3 pb-1 pt-3 text-sm text-accent hover:underline"
                            >
                              View all services →
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </div>

          <button
            className="flex h-8 w-8 flex-col items-end justify-center gap-1.5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`h-px bg-ink transition-all duration-300 ${open ? "w-6 translate-y-[3px] rotate-45" : "w-6"}`} />
            <span className={`h-px bg-ink transition-all duration-300 ${open ? "w-6 -translate-y-[3px] -rotate-45" : "w-4"}`} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[75] overflow-y-auto bg-background md:hidden"
          >
            <div className="flex min-h-full flex-col justify-center px-6 py-24">
              {LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={link.href} className="flex items-baseline gap-4 border-b border-rule py-5 text-4xl text-ink">
                    <span className="label text-accent">{String(i + 1).padStart(2, "0")}</span>
                    <span className="display">{link.label}</span>
                  </Link>

                  {/* Categories nested under Services so the same shortcuts
                      exist on touch, where there is no hover. */}
                  {link.href === "/services" && categories.length > 0 && (
                    <div className="flex flex-col border-b border-rule py-2">
                      {categories.map((category) => (
                        <Link
                          key={category}
                          href={`/services#${categoryId(category)}`}
                          onClick={() => setOpen(false)}
                          className="py-2 pl-11 text-sm text-ink-muted"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
