import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GroqProvider } from '@/modules/ai/providers/groq';

const originalFetch = global.fetch;

describe('GroqProvider', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'performance'] });
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        global.fetch = originalFetch;
        vi.clearAllMocks();
    });

    it('Successful generation returns AIResponse', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({
                choices: [{ message: { content: 'Groq response' } }],
                usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
            })
        });

        const provider = new GroqProvider();
        const responsePromise = provider.generateText('test prompt');
        await vi.runAllTimersAsync();
        const response = await responsePromise;

        expect(response.data).toBe('Groq response');
        expect(response.usage.totalTokens).toBe(10);
        expect(response.model).toBe('llama-3.1-8b-instant');
        expect(response.latencyMs).toBeGreaterThanOrEqual(0);
    });

    it('429 error triggers retry and eventually throws RATE_LIMITED', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            text: async () => 'Rate limit exceeded'
        });

        const provider = new GroqProvider();
        const responsePromise = provider.generateText('test').catch(e => e);
        await vi.runAllTimersAsync();
        const err = await responsePromise;

        expect(err.message).toBe('RATE_LIMITED');
        expect(global.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    });

    it('401 -> throws INVALID_API_KEY', async () => {
        (global.fetch as any).mockResolvedValue({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: async () => 'Invalid key'
        });

        const provider = new GroqProvider();
        const responsePromise = provider.generateText('test').catch(e => e);
        await vi.runAllTimersAsync();
        const err = await responsePromise;

        expect(err.message).toBe('INVALID_API_KEY');
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });
});
