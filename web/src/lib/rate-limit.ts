import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter backed by Upstash Redis.
 * Reads Vercel KV env vars (KV_REST_API_URL / KV_REST_API_TOKEN)
 * with fallback to the raw Upstash names.
 */
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Rate limiting disabled: Redis env vars not set");
    return null;
  }

  return new Redis({ url, token });
}

const redis = getRedis();

/** 5 form submissions per IP per hour (spec NFR-08) */
export const formLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "dyp:form",
    })
  : null;

/** 1 review per listing per device per 30 days */
export const reviewLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "30 d"),
      prefix: "dyp:review",
    })
  : null;

/** General API rate limit: 60 requests per minute */
export const apiLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "dyp:api",
    })
  : null;
