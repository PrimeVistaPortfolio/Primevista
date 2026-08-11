/**
 * Themeable regions of the public site.
 *
 * The site is built on CSS custom properties (`--color-background`, `--color-ink`,
 * …) that `.theme-dark` / `.theme-light` redefine, so re-theming any subtree is a
 * one-class change. This registry names the subtrees an admin is allowed to flip,
 * and is the single source of truth for both the web renderer and the admin UI —
 * add a region here and it appears in Site Settings automatically.
 *
 * Keys deliberately avoid dots: they are stored as Mongo document field names.
 */

// Per-region choice. "inherit" follows the site-wide base theme.
const THEME_MODES = ["inherit", "dark", "light"];

// Site-wide base. Everything on "inherit" resolves to this.
const BASE_THEMES = ["dark", "light"];

const THEME_REGIONS = [
  { key: "navbar", label: "Navigation bar", group: "Global" },
  { key: "footer", label: "Footer", group: "Global" },

  { key: "homeHero", label: "Hero", group: "Home page" },
  { key: "homeAbout", label: "About strip", group: "Home page" },
  { key: "homeClients", label: "Client marquee", group: "Home page" },
  { key: "homeServices", label: "Services grid", group: "Home page" },
  { key: "homeProjects", label: "Featured projects", group: "Home page" },
  { key: "homeProcess", label: "Process timeline", group: "Home page" },
  { key: "homeTeam", label: "Team preview", group: "Home page" },
  { key: "homeCta", label: "Contact CTA", group: "Home page" },

  { key: "pageAbout", label: "About page", group: "Other pages" },
  { key: "pageServices", label: "Services listing", group: "Other pages" },
  { key: "pageServiceDetail", label: "Service detail", group: "Other pages" },
  { key: "pageProjects", label: "Projects listing", group: "Other pages" },
  { key: "pageProjectDetail", label: "Project detail", group: "Other pages" },
  { key: "pageContact", label: "Contact page", group: "Other pages" },
];

const THEME_REGION_KEYS = THEME_REGIONS.map((r) => r.key);

// The layout as originally designed: dark throughout with the closing CTA as a
// light band. Used until an admin saves their own arrangement.
const DEFAULT_SECTION_THEMES = { homeCta: "light" };

/** The site-wide base theme, guarded against junk values. */
function resolveBaseTheme(settings) {
  return BASE_THEMES.includes(settings?.baseTheme) ? settings.baseTheme : "dark";
}

/** The theme a single region ends up in — "dark" or "light", never "inherit". */
function resolveRegionTheme(settings, key) {
  const saved = settings?.sectionThemes;
  // Fall back to the designed defaults wholesale rather than key by key, so an
  // admin who saves an all-inherit arrangement actually gets an all-inherit site.
  const themes = saved && Object.keys(saved).length ? saved : DEFAULT_SECTION_THEMES;
  const mode = themes[key];
  return BASE_THEMES.includes(mode) ? mode : resolveBaseTheme(settings);
}

/**
 * Class to put on a region's wrapper — empty when it already matches the base.
 *
 * Emitting nothing in that case matters: `.theme-dark` / `.theme-light` paint an
 * opaque background, which would hide the aurora layer sitting behind the page.
 */
function regionThemeClass(settings, key) {
  const theme = resolveRegionTheme(settings, key);
  return theme === resolveBaseTheme(settings) ? "" : `theme-${theme}`;
}

module.exports = {
  THEME_MODES,
  BASE_THEMES,
  THEME_REGIONS,
  THEME_REGION_KEYS,
  DEFAULT_SECTION_THEMES,
  resolveBaseTheme,
  resolveRegionTheme,
  regionThemeClass,
};
