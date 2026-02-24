/**
 * @module server/services/cache.service
 * @description Cache service with cache-aside pattern using Upstash Redis.
 * Provides get/set/invalidate/withCache operations with configurable TTLs.
 */

import { redis, getCache, setCache, invalidateCache } from "@/server/lib/redis";

/** Default cache TTL constants (in seconds) */
export const CACHE_TTL = {
  RESUME_DATA: 3600, // 1 hour
  ATS_SCORE: 86400, // 24 hours
  AI_RESPONSE: 86400, // 24 hours
  JD_KEYWORDS: 43200, // 12 hours
} as const;

/**
 * Cache service with cache-aside pattern.
 */
export const cacheService = {
  /**
   * Retrieve a cached value by key.
   *
   * @param key - The cache key
   * @returns The cached value or null
   */
  async get<T>(key: string): Promise<T | null> {
    return getCache<T>(key);
  },

  /**
   * Store a value in the cache with a TTL.
   *
   * @param key - The cache key
   * @param data - The data to cache
   * @param ttlSeconds - Time-to-live in seconds
   */
  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await setCache(key, data, ttlSeconds);
  },

  /**
   * Invalidate (delete) a cache entry by key.
   *
   * @param key - The exact cache key to delete
   */
  async invalidate(key: string): Promise<void> {
    await invalidateCache(key);
  },

  /**
   * Invalidate all cache entries matching a prefix.
   *
   * @param prefix - The key prefix to match
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    if (!redis) {
      return;
    }

    try {
      const keys = await redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        for (const key of keys) {
          await redis.del(key);
        }
      }
    } catch {
      // Fail silently — cache invalidation should not break the app
    }
  },

  /**
   * Cache-aside pattern: check cache, if miss call fetcher, cache result.
   *
   * @param key - The cache key
   * @param ttlSeconds - TTL for the cached value
   * @param fetcher - Function to call on cache miss
   * @returns The cached or freshly-fetched data
   */
  async withCache<T>(
    key: string,
    ttlSeconds: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await getCache<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await setCache(key, data, ttlSeconds);
    return data;
  },
};
