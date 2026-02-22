/**
 * @module tests/unit/lib/rate-limiter.test
 * @description Unit tests for rate limiter configuration.
 */

import { describe, it, expect, vi } from "vitest";

// Mock Redis with class-style mock
vi.mock("@upstash/redis", () => {
    return {
        Redis: class MockRedis {
            get = vi.fn();
            set = vi.fn();
        },
    };
});

// Mock Ratelimit with class-style mock
vi.mock("@upstash/ratelimit", () => {
    class MockRatelimit {
        limit = vi.fn().mockResolvedValue({
            success: true,
            limit: 60,
            remaining: 59,
            reset: Date.now() + 60000,
        });
    }

    return {
        Ratelimit: Object.assign(MockRatelimit, {
            slidingWindow: vi.fn((tokens: number, window: string) => ({
                type: "slidingWindow",
                tokens,
                window,
            })),
        }),
    };
});

describe("Rate Limiter Configuration", () => {
    it("exports three rate limiters", async () => {
        const { rateLimiters } = await import("@/server/lib/rate-limiter");

        expect(rateLimiters).toBeDefined();
        expect(rateLimiters["ai-generation"]).toBeDefined();
        expect(rateLimiters.upload).toBeDefined();
        expect(rateLimiters.general).toBeDefined();
    });

    it("checkRateLimit returns success result", async () => {
        const { checkRateLimit } = await import("@/server/lib/rate-limiter");
        const result = await checkRateLimit("general", "user-123");

        expect(result.success).toBe(true);
        expect(result.limit).toBeDefined();
        expect(result.remaining).toBeDefined();
        expect(result.reset).toBeDefined();
    });

    it("checkRateLimit accepts all valid limiter types", async () => {
        const { checkRateLimit } = await import("@/server/lib/rate-limiter");

        const types: Array<"ai-generation" | "upload" | "general"> = [
            "ai-generation",
            "upload",
            "general",
        ];

        for (const type of types) {
            const result = await checkRateLimit(type, "user-123");
            expect(result).toBeDefined();
            expect(typeof result.success).toBe("boolean");
        }
    });
});
