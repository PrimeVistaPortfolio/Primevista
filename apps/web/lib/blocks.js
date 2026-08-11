export function getBlock(page, type) {
  const block = page?.blocks?.find((b) => b.type === type && b.visible !== false);
  return block?.data || null;
}
