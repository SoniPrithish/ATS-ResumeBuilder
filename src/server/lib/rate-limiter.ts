/**
 * @module server/lib/rate-limiter
 * @description Upstash rate limiting with pre-configured limits for
 * different operation types. Uses sliding window algorithm.
 *
 * @example
 * ```ts
 * import { rateLimiters, checkRateLimit } from "@/server/lib/rate-limiter";
 *
 * const result = await checkRateLimit("ai-generation", userId);
 * if (!result.success) {
 *   throw new Error("Rate limit exceeded");
 * }
 * ```
 */

import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Rate limiter configurations for different operation types.
 * Each limiter uses a sliding window algorithm backed by Upstash Redis.
 */
export const rateLimiters = {
    /** AI generation: 5 requests per minute per user */
    "ai-generation": new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        prefix: "ratelimit:ai-generation",
        analytics: true,
    }),

    /** File upload: 10 requests per hour per user */
    upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 h"),
        prefix: "ratelimit:upload",
        analytics: true,
    }),

    /** General API: 60 requests per minute per user */
    general: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "ratelimit:general",
        analytics: true,
    }),
} as const;

/** Available rate limiter types */
export type RateLimiterType = keyof typeof rateLimiters;

/** Rate limit check result */
export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check rate limit for a given operation type and identifier.
 *
 * @param type - The rate limiter to check against
 * @param identifier - Unique identifier (usually userId or IP)
 * @returns Rate limit check result
 */
export async function checkRateLimit(
    type: RateLimiterType,
    identifier: string
): Promise<RateLimitResult> {
    try {
        const limiter = rateLimiters[type];
        const result = await limiter.limit(identifier);

        return {
            success: result.success,
            limit: result.limit,
            remaining: result.remaining,
            reset: result.reset,
        };
    } catch (error) {
        console.error(
            `[RateLimit] Failed to check rate limit for "${type}":`,
            error
        );
        // Fail open — allow the request if rate limiting itself fails
        return {
            success: true,
            limit: 0,
            remaining: 0,
            reset: 0,
        };
    }
}
