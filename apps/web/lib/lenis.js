// Lenis is created inside SmoothScrollProvider, but other components (the
// scroll-to-top button, anchor links) need to drive it. A module singleton is
// enough here — there is only ever one instance, and a context would force
// every consumer to sit inside a provider for no benefit.
let instance = null;

export function setLenis(lenis) {
  instance = lenis;
}

/** Returns the active Lenis instance, or null when smooth scroll is disabled
 *  (reduced motion) or not yet initialised. Callers must handle null. */
export function getLenis() {
  return instance;
}
