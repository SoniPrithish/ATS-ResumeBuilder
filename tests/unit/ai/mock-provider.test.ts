import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '@/modules/ai/providers/mock';

describe('MockAIProvider', () => {
    describe('generateText', () => {
        it('returns valid AIResponse shape with all required fields', async () => {
            const provider = new MockAIProvider();
            const response = await provider.generateText('generic prompt');

            expect(response).toHaveProperty('data');
            expect(response).toHaveProperty('usage');
            expect(response.usage).toHaveProperty('promptTokens');
            expect(response.usage).toHaveProperty('completionTokens');
            expect(response.usage).toHaveProperty('totalTokens');
            expect(response).toHaveProperty('model', 'mock-model');
            expect(response).toHaveProperty('latencyMs');
            expect(response).toHaveProperty('cached', false);
            expect(typeof response.data).toBe('string');
            expect(typeof response.latencyMs).toBe('number');
        });

        it('returns enhanced bullet response for "enhance" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('please enhance this bullet');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('original');
            expect(parsed).toHaveProperty('enhanced');
            expect(parsed).toHaveProperty('explanation');
        });

        it('returns enhanced bullet response for "bullet" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('rewrite this bullet point');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('enhanced');
        });

        it('returns tailor result for "tailor" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('tailor this resume');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('tailoredSummary');
            expect(parsed).toHaveProperty('bulletSuggestions');
            expect(parsed.bulletSuggestions).toBeInstanceOf(Array);
            expect(parsed).toHaveProperty('skillsToHighlight');
            expect(parsed).toHaveProperty('keywordsToAdd');
        });

        it('returns summary result for "summary" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('generate a summary');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('summary');
            expect(parsed).toHaveProperty('alternatives');
            expect(parsed.alternatives).toBeInstanceOf(Array);
        });

        it('returns keywords for "extract" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('extract keywords');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('hardSkills');
            expect(parsed).toHaveProperty('softSkills');
            expect(parsed).toHaveProperty('tools');
        });

        it('returns skill gaps for "skill gap" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('find skill gap');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('missingSkills');
            expect(parsed).toHaveProperty('recommendations');
        });

        it('returns parsed JD for "job description" prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('parse job description');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toHaveProperty('title');
            expect(parsed).toHaveProperty('company');
            expect(parsed).toHaveProperty('requirements');
        });

        it('returns generic response for unrecognized prompt', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('hello world random');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toEqual({ message: 'Generic response' });
        });

        it('returns same output for same prompt (deterministic)', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res1 = await provider.generateText('enhance this bullet');
            const res2 = await provider.generateText('enhance this bullet');

            expect(res1.data).toBe(res2.data);
        });

        it('handles empty prompt gracefully', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateText('');
            const parsed = JSON.parse((res as any).data);

            expect(parsed).toEqual({ message: 'Generic response' });
        });
    });

    describe('generateObject', () => {
        it('returns parsed object from mock response', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const res = await provider.generateObject<{ summary: string }>(
                'generate a summary',
                { summary: 'string' },
            );

            expect((res as any).data).toHaveProperty('summary');
            expect(typeof (res as any).data.summary).toBe('string');
        });

        it('preserves usage and model metadata', async () => {
            const provider = new MockAIProvider({ delay: 1, defaultTokens: 100 });
            const res = await provider.generateObject(
                'generate a summary',
                { summary: 'string' },
            );

            expect(res.usage.totalTokens).toBe(100);
            expect(res.model).toBe('mock-model');
        });
    });

    describe('generateStream', () => {
        it('yields all characters of the response', async () => {
            const provider = new MockAIProvider({ delay: 5 });
            const stream = provider.generateStream('summary');

            let result = '';
            for await (const chunk of stream) {
                result += chunk;
                expect(chunk.length).toBe(1); // one char at a time
            }

            expect(result.length).toBeGreaterThan(0);
            const parsed = JSON.parse(result);
            expect(parsed).toHaveProperty('summary');
        });

        it('yielded chars reconstruct valid JSON', async () => {
            const provider = new MockAIProvider({ delay: 1 });
            const stream = provider.generateStream('extract keywords');

            let result = '';
            for await (const chunk of stream) {
                result += chunk;
            }

            const parsed = JSON.parse(result);
            expect(parsed).toHaveProperty('hardSkills');
        });
    });

    describe('estimateTokens', () => {
        it('returns 1 for 4 characters', () => {
            const provider = new MockAIProvider();
            expect(provider.estimateTokens('1234')).toBe(1);
        });

        it('returns 2 for 8 characters', () => {
            const provider = new MockAIProvider();
            expect(provider.estimateTokens('12345678')).toBe(2);
        });

        it('rounds up for partial tokens', () => {
            const provider = new MockAIProvider();
            expect(provider.estimateTokens('12345')).toBe(2); // 5/4 = 1.25 → 2
        });

        it('returns 0 for empty string', () => {
            const provider = new MockAIProvider();
            expect(provider.estimateTokens('')).toBe(0);
        });
    });

    describe('configuration', () => {
        it('respects configurable delay', async () => {
            const start = performance.now();
            const provider = new MockAIProvider({ delay: 200 });
            await provider.generateText('test');
            const elapsed = performance.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(190);
        });

        it('respects custom defaultTokens', async () => {
            const provider = new MockAIProvider({ delay: 1, defaultTokens: 123 });
            const res = await provider.generateText('test');

            expect(res.usage.totalTokens).toBe(123);
        });

        it('uses sensible defaults when no options provided', async () => {
            const provider = new MockAIProvider();
            const res = await provider.generateText('test');

            expect(res.usage.totalTokens).toBe(50); // default
        });
    });

    describe('getModelId', () => {
        it('returns mock-model', () => {
            const provider = new MockAIProvider();
            expect(provider.getModelId()).toBe('mock-model');
        });
    });
});
