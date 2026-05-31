import "server-only";

/**
 * Simple in-memory sliding-window rate limiter. Works on a single Vercel
 * instance and resets on cold start. That's fine for a portfolio SaaS at small
 * scale and gives users a natural "grace period" after deploys.
 *
 * To upgrade to multi-instance (when you scale or move off Vercel free):
 *   npm install @upstash/redis @upstash/ratelimit
 *   Swap the body of `checkRateLimit` to use:
 *     Ratelimit.slidingWindow(limit, `${windowSeconds} s`)
 *   Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN in env.
 */

type Bucket = {
  // Timestamps of recent hits, sorted ascending. We trim everything older
  // than the window on each call, so memory stays bounded by `limit`.
  hits: number[];
};

const store = new Map<string, Bucket>();

// Periodic cleanup so abandoned keys don't leak. Runs lazily on every call
// once per minute.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of store) {
    if (bucket.hits.length === 0 || now - bucket.hits[bucket.hits.length - 1] > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  const bucket = store.get(key) ?? { hits: [] };
  // Drop hits older than the window.
  while (bucket.hits.length > 0 && bucket.hits[0] < cutoff) {
    bucket.hits.shift();
  }

  if (bucket.hits.length >= limit) {
    const oldestInWindow = bucket.hits[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.hits.push(now);
  store.set(key, bucket);
  return {
    ok: true,
    remaining: limit - bucket.hits.length,
    retryAfterSeconds: 0,
  };
}

export function formatRetryAfter(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"}`;
}
