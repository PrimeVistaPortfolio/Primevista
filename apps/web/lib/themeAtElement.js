// Which theme a given point on the page is sitting in.
//
// Chrome that floats above the page — the custom cursor, the fixed header —
// can't inherit colour tokens from the section it happens to be over, so it has
// to look the theme up and invert itself against it.
//
// Both classes have to be in the selector. <html> always carries one of them,
// so testing for `.theme-light` alone matches every element on a light-based
// site, including the ones inside a dark band.

const THEME_SELECTOR = ".theme-light, .theme-dark";

/** The theme of the nearest themed ancestor, falling back to the page's base. */
export function themeOfElement(element) {
  const themed = element?.closest?.(THEME_SELECTOR);
  if (themed) return themed.classList.contains("theme-light") ? "light" : "dark";
  return document.documentElement.classList.contains("theme-light") ? "light" : "dark";
}

/**
 * The theme of whatever is under a viewport point, ignoring `exclude`.
 *
 * The exclusion matters for the header: it covers the point it wants to probe,
 * and reading the theme off itself would just echo back what it already had.
 */
export function themeAtPoint(x, y, exclude) {
  const stack = document.elementsFromPoint(x, y);
  const under = exclude ? stack.find((element) => !exclude.contains(element)) : stack[0];
  return under ? themeOfElement(under) : null;
}
