/**
 * Tiny in-memory sliding-window rate limiter.
 *
 * Scope note: state lives in one Node process, so on Cloud Run the limit is
 * per instance. That is deliberate — it blunts casual abuse of the form with
 * zero infrastructure. For a hard global limit, put Cloud Armor in front or
 * move the counter to Firestore/Redis.
 */
type Bucket = number[];
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    buckets.set(key, hits);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - hits[0])) / 1000) };
  }

  hits.push(now);
  buckets.set(key, hits);

  // Bound memory: drop the oldest key when the map grows too large.
  if (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }
  return { ok: true, retryAfter: 0 };
}
