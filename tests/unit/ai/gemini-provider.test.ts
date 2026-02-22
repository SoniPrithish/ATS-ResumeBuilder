import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { generateText } from 'ai';
import { AIProviderError } from '@/modules/ai/utils';

vi.mock('ai', () => ({
    generateText: vi.fn(),
    streamText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn((model: string) => `mocked-google-${model}`),
}));

describe('GeminiProvider', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'performance'] });
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('generateText', () => {
        it('returns a valid AIResponse with all required fields', async () => {
            (generateText as any).mockResolvedValue({
                text: 'Hello world',
                usage: { promptTokens: 3, completionTokens: 7, totalTokens: 10 },
            });

            const provider = new GeminiProvider();
            const responsePromise = provider.generateText('test prompt', {
                temperature: 0.5,
            });

            await vi.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.data).toBe('Hello world');
            expect(response.usage.promptTokens).toBe(3);
            expect(response.usage.completionTokens).toBe(7);
            expect(response.usage.totalTokens).toBe(10);
            expect(response.model).toBe('gemini-1.5-flash');
            expect(response.latencyMs).toBeGreaterThanOrEqual(0);
            expect(response.cached).toBe(false);
        });

        it('uses default model gemini-1.5-flash', () => {
            const provider = new GeminiProvider();
            expect(provider.getModelId()).toBe('gemini-1.5-flash');
        });

        it('accepts custom model', () => {
            const provider = new GeminiProvider('gemini-1.5-pro');
            expect(provider.getModelId()).toBe('gemini-1.5-pro');
        });

        it('defaults maxTokens to 2048 and temperature to 0.7', async () => {
            (generateText as any).mockResolvedValue({
                text: 'test',
                usage: { totalTokens: 1 },
            });

            const provider = new GeminiProvider();
            const promise = provider.generateText('test');
            await vi.runAllTimersAsync();
            await promise;

            expect(generateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    maxTokens: 2048,
                    temperature: 0.7,
                }),
            );
        });

        it('handles missing usage fields gracefully (defaults to 0)', async () => {
            (generateText as any).mockResolvedValue({
                text: 'partial usage',
                usage: {},
            });

            const provider = new GeminiProvider();
            const promise = provider.generateText('test');
            await vi.runAllTimersAsync();
            const response = await promise;

            expect(response.usage.promptTokens).toBe(0);
            expect(response.usage.completionTokens).toBe(0);
            expect(response.usage.totalTokens).toBe(0);
        });
    });

    describe('retry logic', () => {
        it('retries on 429 and succeeds on second attempt', async () => {
            const err: any = new Error('Rate limit');
            err.statusCode = 429;

            (generateText as any)
                .mockRejectedValueOnce(err)
                .mockResolvedValueOnce({
                    text: 'Success after retry',
                    usage: { totalTokens: 5 },
                });

            const provider = new GeminiProvider();
            const responsePromise = provider.generateText('test', {});
            await vi.runAllTimersAsync();
            const response = await responsePromise;

            expect(generateText).toHaveBeenCalledTimes(2);
            expect(response.data).toBe('Success after retry');
        });

        it('throws AIProviderError with RATE_LIMITED after exhausting retries', async () => {
            const err: any = new Error('Rate limit');
            err.statusCode = 429;

            (generateText as any).mockRejectedValue(err);

            const provider = new GeminiProvider();
            const promise = provider.generateText('test', {}).catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('RATE_LIMITED');
            expect(caughtErr.provider).toBe('gemini');
            expect(generateText).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
        });

        it('throws AIProviderError with INVALID_API_KEY on 401 immediately', async () => {
            const err: any = new Error('Unauthorized');
            err.statusCode = 401;

            (generateText as any).mockRejectedValue(err);

            const provider = new GeminiProvider();
            const promise = provider.generateText('test', {}).catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('INVALID_API_KEY');
            expect(generateText).toHaveBeenCalledTimes(1);
        });

        it('throws AIProviderError with GENERATION_FAILED on unknown errors', async () => {
            (generateText as any).mockRejectedValue(new Error('Network error'));

            const provider = new GeminiProvider();
            const promise = provider.generateText('test', {}).catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('AI_GENERATION_FAILED');
        });
    });

    describe('latency measurement', () => {
        it('accurately measures response time', async () => {
            (generateText as any).mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return {
                    text: 'Latency text',
                    usage: { totalTokens: 10 },
                };
            });

            const provider = new GeminiProvider();
            const responsePromise = provider.generateText('test', {});
            await vi.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.latencyMs).toBeGreaterThanOrEqual(100);
        });
    });

    describe('estimateTokens', () => {
        it('estimates tokens based on character count / 4', () => {
            const provider = new GeminiProvider();
            expect(provider.estimateTokens('1234')).toBe(1);
            expect(provider.estimateTokens('12345')).toBe(2);
            expect(provider.estimateTokens('')).toBe(0);
        });
    });
});
