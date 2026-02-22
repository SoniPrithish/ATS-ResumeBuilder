import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { withRetry, AIProviderError, AI_ERROR_CODES } from '@/modules/ai/utils';

describe('AI Utils', () => {
    describe('AIProviderError', () => {
        it('creates error with correct properties', () => {
            const err = new AIProviderError('RATE_LIMITED', 'Too many requests', 'gemini', 429);

            expect(err).toBeInstanceOf(Error);
            expect(err).toBeInstanceOf(AIProviderError);
            expect(err.name).toBe('AIProviderError');
            expect(err.code).toBe('RATE_LIMITED');
            expect(err.message).toBe('Too many requests');
            expect(err.provider).toBe('gemini');
            expect(err.statusCode).toBe(429);
        });

        it('works without optional statusCode', () => {
            const err = new AIProviderError('UNKNOWN_PROVIDER', 'Not found', 'test');
            expect(err.statusCode).toBeUndefined();
        });
    });

    describe('AI_ERROR_CODES', () => {
        it('has all expected error codes', () => {
            expect(AI_ERROR_CODES.RATE_LIMITED).toBe('RATE_LIMITED');
            expect(AI_ERROR_CODES.INVALID_API_KEY).toBe('INVALID_API_KEY');
            expect(AI_ERROR_CODES.GENERATION_FAILED).toBe('AI_GENERATION_FAILED');
            expect(AI_ERROR_CODES.UNKNOWN_PROVIDER).toBe('UNKNOWN_PROVIDER');
        });
    });

    describe('withRetry', () => {
        beforeEach(() => {
            vi.useFakeTimers({ toFake: ['setTimeout'] });
        });

        afterEach(() => {
            vi.clearAllTimers();
            vi.useRealTimers();
        });

        it('returns result on first successful call', async () => {
            const fn = vi.fn().mockResolvedValue('success');
            const promise = withRetry(fn, 3, 100, 'test');
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toBe('success');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('retries on 429 and succeeds on second attempt', async () => {
            const err: any = new Error('Rate limit');
            err.statusCode = 429;

            const fn = vi.fn()
                .mockRejectedValueOnce(err)
                .mockResolvedValueOnce('recovered');

            const promise = withRetry(fn, 3, 100, 'test');
            await vi.runAllTimersAsync();
            const result = await promise;

            expect(result).toBe('recovered');
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('throws RATE_LIMITED after exhausting all retries on 429', async () => {
            const err: any = new Error('Rate limit');
            err.statusCode = 429;

            const fn = vi.fn().mockRejectedValue(err);

            const promise = withRetry(fn, 2, 100, 'test-provider').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('RATE_LIMITED');
            expect(caughtErr.provider).toBe('test-provider');
            expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
        });

        it('throws INVALID_API_KEY immediately on 401', async () => {
            const err: any = new Error('Unauthorized');
            err.statusCode = 401;

            const fn = vi.fn().mockRejectedValue(err);

            const promise = withRetry(fn, 3, 100, 'test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('INVALID_API_KEY');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('throws AI_GENERATION_FAILED for non-retryable errors', async () => {
            const fn = vi.fn().mockRejectedValue(new Error('Something broke'));

            const promise = withRetry(fn, 3, 100, 'test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('AI_GENERATION_FAILED');
            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('also checks error.status when statusCode is missing', async () => {
            const err: any = new Error('Unauthorized');
            err.status = 401;

            const fn = vi.fn().mockRejectedValue(err);

            const promise = withRetry(fn, 3, 100, 'test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr.code).toBe('INVALID_API_KEY');
        });

        it('also checks error.response.status', async () => {
            const err: any = new Error('Rate limited');
            err.response = { status: 429 };

            const fn = vi.fn().mockRejectedValue(err);

            const promise = withRetry(fn, 0, 100, 'test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr.code).toBe('RATE_LIMITED');
        });
    });
});
