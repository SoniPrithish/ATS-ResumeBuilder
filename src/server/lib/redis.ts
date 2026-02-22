/**
 * @module server/lib/redis
 * @description Upstash Redis client singleton with typed cache helper functions.
 * Provides get/set/invalidate operations with automatic JSON serialization
 * and configurable TTL.
 *
 * @example
 * ```ts
 * import { redis, getCache, setCache, invalidateCache } from "@/server/lib/redis";
 *
 * const data = await getCache<MyType>("my-key");
 * await setCache("my-key", myData, 3600);
 * await invalidateCache("my-key");
 * ```
 */

import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

/**
 * Upstash Redis client singleton.
 * Creates a single instance reused across hot reloads in development.
 */
export const redis: Redis =
    globalForRedis.redis ??
    new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = redis;
}

/**
 * Retrieve a cached value by key.
 * Returns `null` if the key does not exist or has expired.
 *
 * @param key - The cache key to look up
 * @returns The cached value (deserialized) or null
 */
export async function getCache<T>(key: string): Promise<T | null> {
    try {
        const data = await redis.get<T>(key);
        return data ?? null;
    } catch (error) {
        console.error(`[Redis] Failed to get cache for key "${key}":`, error);
        return null;
    }
}

/**
 * Store a value in the cache with an optional TTL.
 *
 * @param key - The cache key
 * @param value - The value to store (will be JSON-serialized)
 * @param ttlSeconds - Time-to-live in seconds (default: 3600 = 1 hour)
 */
export async function setCache<T>(
    key: string,
    value: T,
    ttlSeconds: number = 3600
): Promise<void> {
    try {
        await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
    } catch (error) {
        console.error(`[Redis] Failed to set cache for key "${key}":`, error);
    }
}

/**
 * Invalidate (delete) a cache entry by key or pattern.
 * Supports exact key deletion. For pattern-based invalidation,
 * use a key prefix and pass it directly.
 *
 * @param key - The exact cache key to delete
 */
export async function invalidateCache(key: string): Promise<void> {
    try {
        await redis.del(key);
    } catch (error) {
        console.error(
            `[Redis] Failed to invalidate cache for key "${key}":`,
            error
        );
    }
}
