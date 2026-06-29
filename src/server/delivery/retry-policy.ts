import { RETRY_BACKOFF_SECONDS } from "@/lib/constants";

/**
 * Given the number of attempts already made, return when the next retry should
 * occur, or null if the backoff schedule is exhausted.
 *
 * attempts=1 → wait 30s, attempts=2 → 2m, attempts=3 → 10m, attempts=4 → 1h,
 * attempts>=5 → null (exhausted).
 */
export function nextRetryAfter(attempts: number, from: Date = new Date()): Date | null {
  const index = attempts - 1;
  if (index < 0 || index >= RETRY_BACKOFF_SECONDS.length) return null;
  return new Date(from.getTime() + RETRY_BACKOFF_SECONDS[index] * 1000);
}
