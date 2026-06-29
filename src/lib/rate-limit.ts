/**
 * Lightweight in-memory fixed-window rate limiter.
 *
 * Note: state lives in process memory, so on serverless/multi-instance hosting
 * limits are enforced per instance (approximate). That's intentional — these
 * limits exist to deter abuse, not to meter usage precisely.
 */

interface Window {
  count: number;
  resetAt: number;
}

const store = new Map<string, Window>();
let lastSweep = 0;

function sweep(now: number): void {
  // Occasionally drop expired windows so the map doesn't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, win] of store) {
    if (win.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const win = store.get(key);
  if (!win || win.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, limit, remaining: limit - 1, resetAt: now + windowMs, retryAfterSec: 0 };
  }

  win.count += 1;
  const ok = win.count <= limit;
  return {
    ok,
    limit,
    remaining: Math.max(0, limit - win.count),
    resetAt: win.resetAt,
    retryAfterSec: ok ? 0 : Math.ceil((win.resetAt - now) / 1000),
  };
}
