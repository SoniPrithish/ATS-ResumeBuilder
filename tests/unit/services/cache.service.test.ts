import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  mockRedis,
  mockCacheHelpers,
  resetAllMocks,
} from "../../helpers/mocks";

import { cacheService, CACHE_TTL } from "@/server/services/cache.service";

describe("cacheService", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("CACHE_TTL constants", () => {
    it("should have correct TTL values", () => {
      expect(CACHE_TTL.RESUME_DATA).toBe(3600);
      expect(CACHE_TTL.ATS_SCORE).toBe(86400);
      expect(CACHE_TTL.AI_RESPONSE).toBe(86400);
      expect(CACHE_TTL.JD_KEYWORDS).toBe(43200);
    });
  });

  describe("get", () => {
    it("should return cached data on hit", async () => {
      const mockData = { name: "test" };
      mockCacheHelpers.getCache.mockResolvedValue(mockData);

      const result = await cacheService.get("test-key");

      expect(result).toEqual(mockData);
      expect(mockCacheHelpers.getCache).toHaveBeenCalledWith("test-key");
    });

    it("should return null on cache miss", async () => {
      mockCacheHelpers.getCache.mockResolvedValue(null);

      const result = await cacheService.get("missing-key");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should store data with TTL", async () => {
      mockCacheHelpers.setCache.mockResolvedValue(undefined);

      await cacheService.set("key", { data: "value" }, 3600);

      expect(mockCacheHelpers.setCache).toHaveBeenCalledWith(
        "key",
        { data: "value" },
        3600
      );
    });
  });

  describe("invalidate", () => {
    it("should delete cache key", async () => {
      mockCacheHelpers.invalidateCache.mockResolvedValue(undefined);

      await cacheService.invalidate("key-to-delete");

      expect(mockCacheHelpers.invalidateCache).toHaveBeenCalledWith(
        "key-to-delete"
      );
    });
  });

  describe("withCache", () => {
    it("should return cached data on hit (no fetcher call)", async () => {
      const cachedData = { result: "cached" };
      mockCacheHelpers.getCache.mockResolvedValue(cachedData);
      const fetcher = vi.fn();

      const result = await cacheService.withCache("key", 3600, fetcher);

      expect(result).toEqual(cachedData);
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("should call fetcher on cache miss and cache result", async () => {
      const freshData = { result: "fresh" };
      mockCacheHelpers.getCache.mockResolvedValue(null);
      mockCacheHelpers.setCache.mockResolvedValue(undefined);
      const fetcher = vi.fn().mockResolvedValue(freshData);

      const result = await cacheService.withCache("key", 3600, fetcher);

      expect(result).toEqual(freshData);
      expect(fetcher).toHaveBeenCalled();
      expect(mockCacheHelpers.setCache).toHaveBeenCalledWith(
        "key",
        freshData,
        3600
      );
    });
  });
});
