import "server-only";

import type { RoastResult } from "@/features/roast/types";

import { config } from "@/config";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { ROAST_CONTENT_VERSION } from "@/features/roast/data/roast-content";

const CACHE_TTL_SECONDS = 15 * 60;
const AUDITS_PER_HOUR = 5;

const redis =
  config.roast.redisUrl && config.roast.redisToken
    ? new Redis({ url: config.roast.redisUrl, token: config.roast.redisToken })
    : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      prefix: "roast:ratelimit",
      limiter: Ratelimit.slidingWindow(AUDITS_PER_HOUR, "1 h"),
    })
  : null;

if (!redis && process.env.NODE_ENV === "production") {
  console.warn(
    "[roast] Upstash Redis is not configured: no rate limit and no cache.",
  );
}

/** Only fresh audits count. Fails open so a Redis outage doesn't break the page. */
export async function takeRateLimit(ip: string) {
  // Unlimited during `next dev` so testing doesn't lock you out.
  if (!ratelimit || process.env.NODE_ENV === "development") {
    return { allowed: true, retryAfterSeconds: 0 };
  }

  try {
    const { success, reset } = await ratelimit.limit(ip);
    return {
      allowed: success,
      retryAfterSeconds: Math.max(Math.ceil((reset - Date.now()) / 1000), 1),
    };
  } catch (error) {
    console.warn("[roast] rate limit check failed", error);
    return { allowed: true, retryAfterSeconds: 0 };
  }
}

function cacheKey(url: string) {
  return `roast:v${ROAST_CONTENT_VERSION}:${url}`;
}

export async function getCachedRoast(url: string) {
  if (!redis) return null;
  try {
    return await redis.get<RoastResult>(cacheKey(url));
  } catch (error) {
    console.warn("[roast] cache read failed", error);
    return null;
  }
}

export async function setCachedRoast(url: string, result: RoastResult) {
  if (!redis) return;
  try {
    await redis.set(cacheKey(url), result, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.warn("[roast] cache write failed", error);
  }
}
