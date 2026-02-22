import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '@/modules/ai/providers/mock';

describe('MockAIProvider', () => {
    it('returns valid AIResponse shape', async () => {
        const provider = new MockAIProvider();
        const response = await provider.generateText('generic prompt', { temperature: 0 });

        expect(response).toHaveProperty('text');
        expect(response).toHaveProperty('tokensUsed');
        expect(response).toHaveProperty('model', 'mock-model');
        expect(response).toHaveProperty('latencyMs');
        expect(response).toHaveProperty('cached');
    });

    it('is deterministic based on prompt content', async () => {
        const provider = new MockAIProvider({ delay: 1 });

        const enhanceRes = await provider.generateText('please enhance this bullet', { temperature: 0 });
        expect(JSON.parse(enhanceRes.text)).toHaveProperty('enhanced');

        const tailorRes = await provider.generateText('tailor this resume', { temperature: 0 });
        expect(JSON.parse(tailorRes.text)).toHaveProperty('tailoredSummary');

        const summaryRes = await provider.generateText('generate a summary', { temperature: 0 });
        expect(JSON.parse(summaryRes.text)).toHaveProperty('summary');

        const extractRes = await provider.generateText('extract keywords', { temperature: 0 });
        expect(JSON.parse(extractRes.text)).toHaveProperty('hardSkills');

        const gapRes = await provider.generateText('find skill gap', { temperature: 0 });
        expect(JSON.parse(gapRes.text)).toHaveProperty('missingSkills');

        const jdRes = await provider.generateText('parse job description', { temperature: 0 });
        expect(JSON.parse(jdRes.text)).toHaveProperty('title');
    });

    it('stream yields all characters', async () => {
        const provider = new MockAIProvider({ delay: 5 });
        const stream = provider.generateStream('summary', { temperature: 0 });

        let result = '';
        for await (const chunk of stream) {
            result += chunk;
        }

        expect(result.length).toBeGreaterThan(0);
        const parsed = JSON.parse(result);
        expect(parsed).toHaveProperty('summary');
    });

    it('estimateTokens is roughly accurate', () => {
        const provider = new MockAIProvider();
        expect(provider.estimateTokens('1234')).toBe(1);
        expect(provider.estimateTokens('12345678')).toBe(2);
    });

    it('respects configurable delay', async () => {
        const start = performance.now();
        const provider = new MockAIProvider({ delay: 200 });
        await provider.generateText('test', { temperature: 0 });
        const end = performance.now();

        expect(end - start).toBeGreaterThanOrEqual(190);
    });
});
