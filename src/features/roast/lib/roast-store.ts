import "server-only";

import type { RoastResult } from "@/features/roast/types";

import { config } from "@/config";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { ROAST_CONTENT_VERSION } from "@/features/roast/data/roast-content";

// AI-written roasts are kept a day. A fallback roast expires sooner so the
// AI gets another go once the free models recover.
const CACHE_TTL_SECONDS = 24 * 60 * 60;
const FALLBACK_CACHE_TTL_SECONDS = 60 * 60;
const AUDITS_PER_HOUR = 5;
// The free OpenRouter tier allows 50 requests a day across all visitors.
const AUDITS_PER_DAY = 25;

const redis =
  config.roast.redisUrl && config.roast.redisToken
    ? new Redis({ url: config.roast.redisUrl, token: config.roast.redisToken })
    : null;

const ratelimits = redis
  ? [
      new Ratelimit({
        redis,
        prefix: "roast:ratelimit",
        limiter: Ratelimit.slidingWindow(AUDITS_PER_HOUR, "1 h"),
      }),
      new Ratelimit({
        redis,
        prefix: "roast:ratelimit:daily",
        limiter: Ratelimit.slidingWindow(AUDITS_PER_DAY, "1 d"),
      }),
    ]
  : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[roast] Upstash Redis is not configured: no rate limit and no cache.",
  );
}

/**
 * 5 an hour and 25 a day per IP. Only fresh audits count. Fails open so a
 * Redis outage doesn't break the page.
 */
export async function takeRateLimit(ip: string) {
  // Unlimited during `next dev` so testing doesn't lock you out.
  if (!ratelimits || process.env.NODE_ENV === "development") {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  try {
    // In order, so a visitor blocked by the hourly limit doesn't burn daily ones.
    for (const ratelimit of ratelimits) {
      const { success, reset } = await ratelimit.limit(ip);
      if (!success) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            Math.ceil((reset - Date.now()) / 1000),
            1,
          ),
        };
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  } catch (error) {
    console.warn("[roast] rate limit check failed", error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

function cacheKey(key: string) {
  return `roast:v${ROAST_CONTENT_VERSION}:${key}`;
}

/** `key` comes from roastCacheKey, so www and non-www share one entry. */
export async function getCachedRoast(key: string) {
  if (!redis) return null;
  try {
    return await redis.get<RoastResult>(cacheKey(key));
  } catch (error) {
    console.warn("[roast] cache read failed", error);
    return null;
  }
}

export async function setCachedRoast(key: string, result: RoastResult) {
  if (!redis) return;
  try {
    await redis.set(cacheKey(key), result, {
      ex: result.aiWritten ? CACHE_TTL_SECONDS : FALLBACK_CACHE_TTL_SECONDS,
    });
  } catch (error) {
    console.warn("[roast] cache write failed", error);
  }
}
