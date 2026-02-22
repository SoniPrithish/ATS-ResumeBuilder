/**
 * @module tests/unit/lib/cache.test
 * @description Unit tests for Redis cache helper functions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Redis before importing — use class-style mock to support `new Redis()`
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();

vi.mock("@upstash/redis", () => {
    return {
        Redis: class MockRedis {
            get = mockGet;
            set = mockSet;
            del = mockDel;
        },
    };
});

describe("Redis Cache Helpers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getCache returns cached data", async () => {
        mockGet.mockResolvedValue({ name: "test" });

        const { getCache } = await import("@/server/lib/redis");
        const result = await getCache<{ name: string }>("test-key");

        expect(result).toEqual({ name: "test" });
        expect(mockGet).toHaveBeenCalledWith("test-key");
    });

    it("getCache returns null when key not found", async () => {
        mockGet.mockResolvedValue(null);

        const { getCache } = await import("@/server/lib/redis");
        const result = await getCache("missing-key");

        expect(result).toBeNull();
    });

    it("getCache returns null on error", async () => {
        mockGet.mockRejectedValue(new Error("Connection failed"));

        const { getCache } = await import("@/server/lib/redis");
        const result = await getCache("error-key");

        expect(result).toBeNull();
    });

    it("setCache stores data with TTL", async () => {
        mockSet.mockResolvedValue("OK");

        const { setCache } = await import("@/server/lib/redis");
        await setCache("test-key", { data: "value" }, 3600);

        expect(mockSet).toHaveBeenCalledWith(
            "test-key",
            JSON.stringify({ data: "value" }),
            { ex: 3600 }
        );
    });

    it("setCache uses default TTL of 3600", async () => {
        mockSet.mockResolvedValue("OK");

        const { setCache } = await import("@/server/lib/redis");
        await setCache("key", "value");

        expect(mockSet).toHaveBeenCalledWith("key", JSON.stringify("value"), {
            ex: 3600,
        });
    });

    it("invalidateCache deletes the key", async () => {
        mockDel.mockResolvedValue(1);

        const { invalidateCache } = await import("@/server/lib/redis");
        await invalidateCache("delete-me");

        expect(mockDel).toHaveBeenCalledWith("delete-me");
    });

    it("invalidateCache handles errors gracefully", async () => {
        mockDel.mockRejectedValue(new Error("Connection failed"));

        const { invalidateCache } = await import("@/server/lib/redis");
        // Should not throw
        await expect(invalidateCache("error-key")).resolves.toBeUndefined();
    });
});
