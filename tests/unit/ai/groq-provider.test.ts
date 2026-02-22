import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GroqProvider } from '@/modules/ai/providers/groq';
import { AIProviderError } from '@/modules/ai/utils';

const originalFetch = global.fetch;

describe('GroqProvider', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'performance'] });
        global.fetch = vi.fn();
        process.env.GROQ_API_KEY = 'test-groq-key';
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        global.fetch = originalFetch;
        vi.clearAllMocks();
        delete process.env.GROQ_API_KEY;
    });

    describe('generateText', () => {
        it('returns a valid AIResponse with all required fields', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'Groq response' } }],
                    usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 },
                }),
            });

            const provider = new GroqProvider();
            const responsePromise = provider.generateText('test prompt');
            await vi.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.data).toBe('Groq response');
            expect(response.usage.promptTokens).toBe(5);
            expect(response.usage.completionTokens).toBe(5);
            expect(response.usage.totalTokens).toBe(10);
            expect(response.model).toBe('llama-3.1-8b-instant');
            expect(response.latencyMs).toBeGreaterThanOrEqual(0);
            expect(response.cached).toBe(false);
        });

        it('sends correct request structure to Groq API', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: 'test' } }],
                    usage: { total_tokens: 1 },
                }),
            });

            const provider = new GroqProvider();
            const promise = provider.generateText('hello', { temperature: 0.5, maxTokens: 500 });
            await vi.runAllTimersAsync();
            await promise;

            expect(global.fetch).toHaveBeenCalledWith(
                'https://api.groq.com/openai/v1/chat/completions',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': 'Bearer test-groq-key',
                        'Content-Type': 'application/json',
                    }),
                }),
            );

            const callBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
            expect(callBody.model).toBe('llama-3.1-8b-instant');
            expect(callBody.temperature).toBe(0.5);
            expect(callBody.max_tokens).toBe(500);
            expect(callBody.messages).toEqual([{ role: 'user', content: 'hello' }]);
        });

        it('handles missing usage/choices gracefully', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [],
                    usage: {},
                }),
            });

            const provider = new GroqProvider();
            const promise = provider.generateText('test');
            await vi.runAllTimersAsync();
            const response = await promise;

            expect(response.data).toBe('');
            expect(response.usage.promptTokens).toBe(0);
            expect(response.usage.totalTokens).toBe(0);
        });

        it('uses custom model name', () => {
            const provider = new GroqProvider('mixtral-8x7b-32768');
            expect(provider.getModelId()).toBe('mixtral-8x7b-32768');
        });
    });

    describe('retry logic', () => {
        it('retries on 429 and eventually throws RATE_LIMITED', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                text: async () => 'Rate limit exceeded',
            });

            const provider = new GroqProvider();
            const promise = provider.generateText('test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('RATE_LIMITED');
            expect(caughtErr.provider).toBe('groq');
            expect(global.fetch).toHaveBeenCalledTimes(4);
        });

        it('throws INVALID_API_KEY on 401 immediately', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized',
                text: async () => 'Invalid key',
            });

            const provider = new GroqProvider();
            const promise = provider.generateText('test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('INVALID_API_KEY');
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it('throws AI_GENERATION_FAILED on 500 errors', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                text: async () => 'Server error',
            });

            const provider = new GroqProvider();
            const promise = provider.generateText('test').catch(e => e);
            await vi.runAllTimersAsync();
            const caughtErr = await promise;

            expect(caughtErr).toBeInstanceOf(AIProviderError);
            expect(caughtErr.code).toBe('AI_GENERATION_FAILED');
        });
    });

    describe('generateObject', () => {
        it('parses response as JSON object', async () => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => ({
                    choices: [{ message: { content: '{"name":"test","count":42}' } }],
                    usage: { total_tokens: 10 },
                }),
            });

            const provider = new GroqProvider();
            const promise = provider.generateObject<{ name: string; count: number }>(
                'return a json object',
                { name: 'string', count: 'number' },
            );
            await vi.runAllTimersAsync();
            const res = await promise;

            expect(res.data.name).toBe('test');
            expect(res.data.count).toBe(42);
        });
    });

    describe('estimateTokens', () => {
        it('estimates correctly', () => {
            const provider = new GroqProvider();
            expect(provider.estimateTokens('1234')).toBe(1);
            expect(provider.estimateTokens('12345')).toBe(2);
            expect(provider.estimateTokens('')).toBe(0);
        });
    });
});
