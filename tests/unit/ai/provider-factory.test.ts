import { describe, it, expect, vi } from 'vitest';
import { createAIProvider, createFallbackProvider, FallbackProvider } from '@/modules/ai/provider';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { GroqProvider } from '@/modules/ai/providers/groq';
import { MockAIProvider } from '@/modules/ai/providers/mock';
import { AIProviderError } from '@/modules/ai/utils';

describe('AI Provider Factory', () => {
    describe('createAIProvider', () => {
        it('creates GeminiProvider for "gemini"', () => {
            expect(createAIProvider('gemini')).toBeInstanceOf(GeminiProvider);
        });

        it('creates GroqProvider for "groq"', () => {
            expect(createAIProvider('groq')).toBeInstanceOf(GroqProvider);
        });

        it('creates MockAIProvider for "mock"', () => {
            expect(createAIProvider('mock')).toBeInstanceOf(MockAIProvider);
        });

        it('defaults to gemini when no name provided', () => {
            expect(createAIProvider()).toBeInstanceOf(GeminiProvider);
        });

        it('throws AIProviderError for unknown provider name', () => {
            expect(() => createAIProvider('invalid' as any)).toThrow(AIProviderError);
            try {
                createAIProvider('nonexistent' as any);
            } catch (err) {
                expect(err).toBeInstanceOf(AIProviderError);
                expect((err as AIProviderError).code).toBe('UNKNOWN_PROVIDER');
            }
        });
    });

    describe('FallbackProvider', () => {
        it('uses primary provider when it succeeds', async () => {
            const primary = new MockAIProvider({ delay: 1 });
            const secondary = new MockAIProvider({ delay: 1 });

            vi.spyOn(primary, 'generateText').mockResolvedValue({
                data: 'primary success',
                usage: { promptTokens: 5, completionTokens: 5, totalTokens: 10 },
                model: 'mock-model',
                latencyMs: 10,
                cached: false,
            });
            vi.spyOn(secondary, 'generateText');

            const fallback = new FallbackProvider(primary, secondary);
            const res = await fallback.generateText('test');

            expect(primary.generateText).toHaveBeenCalled();
            expect(secondary.generateText).not.toHaveBeenCalled();
            expect((res as any).data).toBe('primary success');
        });

        it('falls back to secondary when primary fails', async () => {
            const primary = new MockAIProvider({ delay: 1 });
            const secondary = new MockAIProvider({ delay: 1 });

            vi.spyOn(primary, 'generateText').mockRejectedValue(new Error('Primary failed'));
            vi.spyOn(secondary, 'generateText').mockResolvedValue({
                data: 'fallback success',
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                model: 'mock-model',
                latencyMs: 10,
                cached: false,
            });

            const fallback = new FallbackProvider(primary, secondary);
            const res = await fallback.generateText('test');

            expect(primary.generateText).toHaveBeenCalled();
            expect(secondary.generateText).toHaveBeenCalled();
            expect((res as any).data).toBe('fallback success');
        });

        it('throws when both primary and secondary fail', async () => {
            const primary = new MockAIProvider({ delay: 1 });
            const secondary = new MockAIProvider({ delay: 1 });

            vi.spyOn(primary, 'generateText').mockRejectedValue(new Error('Primary failed'));
            vi.spyOn(secondary, 'generateText').mockRejectedValue(new Error('Secondary also failed'));

            const fallback = new FallbackProvider(primary, secondary);

            await expect(fallback.generateText('test')).rejects.toThrow('Secondary also failed');
        });

        it('falls back for generateObject as well', async () => {
            const primary = new MockAIProvider({ delay: 1 });
            const secondary = new MockAIProvider({ delay: 1 });

            vi.spyOn(primary, 'generateObject').mockRejectedValue(new Error('Primary failed'));
            vi.spyOn(secondary, 'generateObject').mockResolvedValue({
                data: { name: 'test' },
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                model: 'mock-model',
                latencyMs: 10,
                cached: false,
            });

            const fallback = new FallbackProvider(primary, secondary);
            const res = await fallback.generateObject('test', { name: 'string' });

            expect((res as any).data).toEqual({ name: 'test' });
        });

        it('logs a warning when falling back (console.warn)', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const primary = new MockAIProvider({ delay: 1 });
            const secondary = new MockAIProvider({ delay: 1 });

            vi.spyOn(primary, 'generateText').mockRejectedValue(new Error('Primary down'));
            vi.spyOn(secondary, 'generateText').mockResolvedValue({
                data: 'ok',
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                model: 'mock-model',
                latencyMs: 5,
                cached: false,
            });

            const fallback = new FallbackProvider(primary, secondary);
            await fallback.generateText('test');

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('falling back'),
                expect.stringContaining('Primary down'),
            );

            warnSpy.mockRestore();
        });
    });

    describe('createFallbackProvider', () => {
        it('returns a FallbackProvider instance', () => {
            const provider = createFallbackProvider();
            expect(provider).toBeInstanceOf(FallbackProvider);
        });
    });
});
