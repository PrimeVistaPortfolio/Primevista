// Simple in-memory sliding-window rate limiter. Good enough for a single-instance
// deployment; swap for a Redis-backed limiter if scaling to multiple instances.
const buckets = new Map();

function rateLimit(key, { limit = 5, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const bucket = buckets.get(key) || [];
  const recent = bucket.filter((ts) => now - ts < windowMs);
  recent.push(now);
  buckets.set(key, recent);

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, timestamps] of buckets) {
      if (timestamps.every((ts) => now - ts >= windowMs)) buckets.delete(k);
    }
  }

  return {
    allowed: recent.length <= limit,
    remaining: Math.max(0, limit - recent.length),
  };
}

module.exports = { rateLimit };
