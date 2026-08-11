export function slugify(str) {
  return (str || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function csvToArray(str) {
  return (str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
