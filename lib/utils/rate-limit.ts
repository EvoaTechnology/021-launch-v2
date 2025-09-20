/**
 * Lightweight in-memory token bucket rate limiter.
 * Suitable for single-instance deployments. For multi-instance, use a shared store.
 */

type BucketState = {
  tokens: number;
  lastRefillMs: number;
  capacity: number;
  refillRatePerSec: number; // tokens per second
};

const buckets = new Map<string, BucketState>();

function now(): number {
  return Date.now();
}

function getBucket(
  key: string,
  capacity: number,
  refillRatePerSec: number
): BucketState {
  const existing = buckets.get(key);
  if (existing) {
    return existing;
  }
  const state: BucketState = {
    tokens: capacity,
    lastRefillMs: now(),
    capacity,
    refillRatePerSec,
  };
  buckets.set(key, state);
  return state;
}

function refill(state: BucketState, currentMs: number): void {
  const elapsedSec = (currentMs - state.lastRefillMs) / 1000;
  if (elapsedSec <= 0) return;
  const added = elapsedSec * state.refillRatePerSec;
  state.tokens = Math.min(state.capacity, state.tokens + added);
  state.lastRefillMs = currentMs;
}

export function checkRateLimit(
  key: string,
  options: { capacity: number; refillRatePerSec: number }
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const { capacity, refillRatePerSec } = options;
  const state = getBucket(key, capacity, refillRatePerSec);
  const t = now();
  refill(state, t);

  if (state.tokens >= 1) {
    state.tokens -= 1;
    return {
      allowed: true,
      remaining: Math.max(0, Math.floor(state.tokens)),
      retryAfterMs: 0,
    };
  }

  // Compute time until next token (in ms)
  const deficit = 1 - state.tokens;
  const secondsUntilNext = deficit / state.refillRatePerSec;
  const retryAfterMs = Math.ceil(secondsUntilNext * 1000);
  return { allowed: false, remaining: 0, retryAfterMs };
}

export function buildRateKey(
  parts: Array<string | number | undefined | null>
): string {
  return parts
    .filter((p) => p !== undefined && p !== null && String(p).length > 0)
    .join(":");
}
