/**
 * @module server/lib/logger
 * @description Structured JSON logger using Pino. Provides a root logger
 * instance, child logger factory, and timing utilities for performance
 * measurement.
 *
 * @example
 * ```ts
 * import { logger, createChildLogger, withTiming } from "@/server/lib/logger";
 *
 * const log = createChildLogger("resume-parser");
 * log.info({ resumeId }, "Parsing resume");
 *
 * const result = await withTiming(log, "parse", async () => {
 *   return parseResume(file);
 * });
 * ```
 */

import pino from "pino";

/** Root logger instance with JSON output */
export const logger = pino({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
    transport:
        process.env.NODE_ENV === "development"
            ? { target: "pino/file", options: { destination: 1 } }
            : undefined,
    base: {
        service: "techresume-ai",
        env: process.env.NODE_ENV,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
        level: (label: string) => ({ level: label }),
    },
});

/**
 * Create a child logger with a specific module context.
 *
 * @param module - The module name for log context
 * @param bindings - Additional default bindings
 * @returns A Pino child logger
 */
export function createChildLogger(
    module: string,
    bindings: Record<string, unknown> = {}
): pino.Logger {
    return logger.child({ module, ...bindings });
}

/**
 * Measure and log the execution time of an async operation.
 *
 * @param log - The logger instance to use
 * @param operationName - A label for the operation being timed
 * @param fn - The async function to execute and time
 * @returns The result of the async function, with timing logged
 */
export async function withTiming<T>(
    log: pino.Logger,
    operationName: string,
    fn: () => Promise<T>
): Promise<T> {
    const start = performance.now();
    try {
        const result = await fn();
        const durationMs = Math.round(performance.now() - start);
        log.info({ operation: operationName, durationMs }, `${operationName} completed`);
        return result;
    } catch (error) {
        const durationMs = Math.round(performance.now() - start);
        log.error(
            { operation: operationName, durationMs, error },
            `${operationName} failed`
        );
        throw error;
    }
}

/**
 * Create a request-scoped logger with request context.
 *
 * @param requestId - Unique request identifier
 * @param userId - The authenticated user ID (if available)
 * @returns A child logger with request context
 */
export function createRequestLogger(
    requestId: string,
    userId?: string
): pino.Logger {
    return logger.child({
        requestId,
        userId,
        module: "request",
    });
}
