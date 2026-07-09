import type { NextRequest } from "next/server";
import { redis, CacheKeys } from "@/lib/redis";
import { env } from "@/lib/env";
import { TooManyRequestsError } from "@/errors/AppError";
import type { RouteContext, RouteHandler, RouteParams } from "@/types/api";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
  bucket: string;
  windowSeconds?: number;
  maxRequests?: number;
  /** Custom identifier resolver (defaults to client IP) — pass a user-id resolver for per-account limits. */
  identifier?: (req: NextRequest) => string;
}

/** Fixed-window rate limiter backed by Redis `INCR` + `EXPIRE` — cheap, atomic, safe under concurrency. */
export function withRateLimit<P extends RouteParams = RouteParams>(
  options: RateLimitOptions,
  handler: RouteHandler<P>
): RouteHandler<P> {
  const windowSeconds = options.windowSeconds ?? env.RATE_LIMIT_WINDOW_SECONDS;
  const maxRequests = options.maxRequests ?? env.RATE_LIMIT_MAX_REQUESTS;

  return async (req: NextRequest, ctx: RouteContext<P>) => {
    const identifier = options.identifier?.(req) ?? getClientIp(req);
    const key = CacheKeys.rateLimit(options.bucket, identifier);

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      const ttl = await redis.ttl(key);
      throw new TooManyRequestsError("Rate limit exceeded, please try again later", ttl > 0 ? ttl : windowSeconds);
    }

    return handler(req, ctx);
  };
}
