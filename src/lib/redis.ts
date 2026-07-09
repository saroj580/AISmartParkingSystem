import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const globalForRedis = globalThis as unknown as { __redis?: Redis };

function createRedisClient(): Redis {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
    // Keep raw strings so existing JSON.parse/stringify call-sites behave
    // exactly as they did with ioredis.
    automaticDeserialization: false,
  });
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
  const cached = await redis.get<string>(key);
  if (cached) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      // fall through to refetch on corrupt cache entry
    }
  }

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), { ex: ttlSeconds });
  return fresh;
}

export async function invalidateCache(pattern: string): Promise<void> {
  let cursor = "0";
  const keysToDelete: string[] = [];

  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    cursor = nextCursor;
    keysToDelete.push(...keys);
  } while (cursor !== "0");

  if (keysToDelete.length) {
    await redis.del(...keysToDelete);
  }
}