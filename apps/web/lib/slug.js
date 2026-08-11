/**
 * Stable DOM id for a service category section.
 *
 * Lives here rather than in @primevista/shared because the navbar is a client
 * component — importing the shared package there would pull Mongoose into the
 * browser bundle. Both the navbar and the services page use this, so the
 * anchors always agree.
 */
export function categoryId(category) {
  const slug = String(category || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `category-${slug}`;
}
