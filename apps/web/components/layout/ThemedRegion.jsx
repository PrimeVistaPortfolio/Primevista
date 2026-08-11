import { regionThemeClass } from "@primevista/shared";

/**
 * Wraps a slice of the page in the theme an admin picked for it.
 *
 * The class it emits redefines the colour tokens for everything inside, so the
 * section components themselves stay theme-agnostic — they only ever reference
 * `text-ink`, `bg-surface`, `border-rule` and friends.
 *
 * When a region already matches the site-wide base theme no class is emitted,
 * which leaves the aurora backdrop visible instead of covering it with an
 * opaque band.
 */
export default function ThemedRegion({ settings, region, className = "", children }) {
  const themeClass = regionThemeClass(settings, region);
  const classes = `${themeClass} ${className}`.trim();
  return <div className={classes || undefined}>{children}</div>;
}
