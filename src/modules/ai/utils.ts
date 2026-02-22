/**
 * Shared AI provider error types used across all providers.
 */
export class AIProviderError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;
    public readonly provider: string;

    constructor(code: string, message: string, provider: string, statusCode?: number) {
        super(message);
        this.name = 'AIProviderError';
        this.code = code;
        this.provider = provider;
        this.statusCode = statusCode;
    }
}

/** Well-known AI error codes */
export const AI_ERROR_CODES = {
    RATE_LIMITED: 'RATE_LIMITED',
    INVALID_API_KEY: 'INVALID_API_KEY',
    GENERATION_FAILED: 'AI_GENERATION_FAILED',
    UNKNOWN_PROVIDER: 'UNKNOWN_PROVIDER',
} as const;

/**
 * Execute a function with exponential backoff retry on 429 errors.
 *
 * @param fn - The async function to execute
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param baseDelayMs - Base delay in ms for exponential backoff (default: 1000)
 * @param providerName - Provider name for error context
 * @returns The result of the function
 * @throws AIProviderError on exhausted retries, auth failures, or other errors
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000,
    providerName: string = 'unknown',
): Promise<T> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const error = err as Record<string, unknown>;
            const status =
                error?.statusCode ??
                error?.status ??
                (error?.response as Record<string, unknown>)?.status;

            if (status === 429) {
                if (attempt === maxRetries) {
                    throw new AIProviderError(
                        AI_ERROR_CODES.RATE_LIMITED,
                        `Rate limit exceeded after ${maxRetries} retries`,
                        providerName,
                        429,
                    );
                }
                const delay = baseDelayMs * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
            }

            if (status === 401) {
                throw new AIProviderError(
                    AI_ERROR_CODES.INVALID_API_KEY,
                    'Invalid or missing API key',
                    providerName,
                    401,
                );
            }

            throw new AIProviderError(
                AI_ERROR_CODES.GENERATION_FAILED,
                (error?.message as string) ?? 'Unknown error',
                providerName,
                status as number | undefined,
            );
        }
    }

    // TypeScript exhaustiveness — should be unreachable
    throw new AIProviderError(
        AI_ERROR_CODES.GENERATION_FAILED,
        'Retry loop exited unexpectedly',
        providerName,
    );
}
