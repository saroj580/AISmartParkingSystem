import Redis from "ioredis";
import { env } from "@/lib/env";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("redis");

const globalForRedis = globalThis as unknown as { __redis?: Redis };

function createRedisClient(): Redis {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 200, 2000);
    },
    lazyConnect: false,
  });

  client.on("error", (err) => log.error({ err }, "Redis connection error"));
  client.on("connect", () => log.info("Redis connected"));

  return client;
}

export const redis = globalForRedis.__redis ?? createRedisClient();

if (env.NODE_ENV !== "production") {
  globalForRedis.__redis = redis;
}

/** Cache namespace keys — single source of truth to avoid key-drift across modules. */
export const CacheKeys = {
  nearbyLots: (lat: number, lng: number, radiusKm: number, vehicleType?: string) =>
    `cache:nearby:${lat.toFixed(3)}:${lng.toFixed(3)}:${radiusKm}:${vehicleType ?? "all"}`,
  lotAvailability: (lotId: string, vehicleType: string) => `cache:availability:${lotId}:${vehicleType}`,
  lotAvailabilitySummary: (lotId: string) => `cache:availability:${lotId}:summary`,
  dashboardMetrics: (operatorId: string) => `cache:dashboard:${operatorId}`,
  analyticsSummary: (lotId: string, range: string) => `cache:analytics:${lotId}:${range}`,
  rateLimit: (bucket: string, identifier: string) => `ratelimit:${bucket}:${identifier}`,
  refreshTokenDeny: (jti: string) => `denylist:refresh:${jti}`,
} as const;

/** Get-or-set JSON cache helper with a TTL, used across analytics/availability caching. */
export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // fall through to refetch on corrupt cache entry
    }
  }

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  return fresh;
}

export async function invalidateCache(pattern: string): Promise<void> {
  const stream = redis.scanStream({ match: pattern, count: 100 });
  const pipeline = redis.pipeline();
  let found = false;

  for await (const keys of stream) {
    if (keys.length) {
      found = true;
      keys.forEach((key: string) => pipeline.del(key));
    }
  }

  if (found) {
    await pipeline.exec();
  }
}
