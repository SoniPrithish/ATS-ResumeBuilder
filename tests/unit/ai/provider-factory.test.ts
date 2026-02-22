import { describe, it, expect, vi } from 'vitest';
import { createAIProvider, createFallbackProvider, FallbackProvider } from '@/modules/ai/provider';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { GroqProvider } from '@/modules/ai/providers/groq';
import { MockAIProvider } from '@/modules/ai/providers/mock';

describe('AI Provider Factory', () => {
    it('creates correct provider type', () => {
        expect(createAIProvider('gemini')).toBeInstanceOf(GeminiProvider);
        expect(createAIProvider('groq')).toBeInstanceOf(GroqProvider);
        expect(createAIProvider('mock')).toBeInstanceOf(MockAIProvider);
    });

    it('unknown name throws UNKNOWN_PROVIDER', () => {
        expect(() => createAIProvider('invalid' as any)).toThrow('UNKNOWN_PROVIDER');
    });

    it('FallbackProvider tries primary first and then secondary', async () => {
        const primary = new MockAIProvider();
        const secondary = new MockAIProvider();

        vi.spyOn(primary, 'generateText').mockRejectedValue(new Error('Primary failed'));
        vi.spyOn(secondary, 'generateText').mockResolvedValue({
            data: 'fallback success',
            usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
            model: 'mock-model',
            latencyMs: 10,
            cached: false
        });

        const fallback = new FallbackProvider(primary, secondary);
        const res = await fallback.generateText('test');

        expect(primary.generateText).toHaveBeenCalled();
        expect(secondary.generateText).toHaveBeenCalled();
        expect(res.data).toBe('fallback success');
    });

    it('createFallbackProvider creates a valid FallbackProvider', () => {
        const provider = createFallbackProvider();
        expect(provider).toBeInstanceOf(FallbackProvider);
    });
});
