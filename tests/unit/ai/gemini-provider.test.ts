import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { generateText } from 'ai';

vi.mock('ai', () => ({
    generateText: vi.fn(),
    streamText: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn((model) => `mocked-google-${model}`),
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

    it('Successful generation returns AIResponse', async () => {
        (generateText as any).mockResolvedValue({
            text: 'Hello world',
            usage: { totalTokens: 10 },
        });

        const provider = new GeminiProvider();
        const responsePromise = provider.generateText('test prompt', {
            systemPrompt: 'system prompt',
            temperature: 0.5,
        });

        await vi.runAllTimersAsync();
        const response = await responsePromise;

        expect(response.data).toBe('Hello world');
        expect(response.usage.totalTokens).toBe(10);
        expect(response.model).toBe('gemini-1.5-flash');
        expect(response.latencyMs).toBeGreaterThanOrEqual(0);
        expect(response.cached).toBe(false);
    });

    it('429 error triggers retry', async () => {
        const error: any = new Error('Rate limit');
        error.statusCode = 429;

        (generateText as any)
            .mockRejectedValueOnce(error)
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

    it('429 exhausts retries throws RATE_LIMITED', async () => {
        const err: any = new Error('Rate limit');
        err.statusCode = 429;

        (generateText as any).mockRejectedValue(err);

        const provider = new GeminiProvider();

        const responsePromise = provider.generateText('test', {}).catch(e => e);

        await vi.runAllTimersAsync();

        const caughtErr = await responsePromise;
        expect(caughtErr.message).toBe('RATE_LIMITED');
        expect(generateText).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('401 -> throws INVALID_API_KEY', async () => {
        const err: any = new Error('Unauthorized');
        err.statusCode = 401;

        (generateText as any).mockRejectedValue(err);

        const provider = new GeminiProvider();

        const responsePromise = provider.generateText('test', {}).catch(e => e);
        await vi.runAllTimersAsync();

        const caughtErr = await responsePromise;
        expect(caughtErr.message).toBe('INVALID_API_KEY');
        expect(generateText).toHaveBeenCalledTimes(1);
    });

    it('Latency is measured', async () => {
        (generateText as any).mockImplementation(async () => {
            // simulate 100ms processing delay mapped from fake timer
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
