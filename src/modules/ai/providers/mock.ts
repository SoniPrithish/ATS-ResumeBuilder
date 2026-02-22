import type { AIProvider, AIOptions, AIResponse } from '@/types/ai';
import type { ExtendedAIProvider } from '@/modules/ai/types';

/**
 * MockAIProvider — deterministic AI provider for testing.
 *
 * Generates predictable responses based on prompt content keywords.
 * All tests should use this provider to avoid real API calls.
 */
export class MockAIProvider implements AIProvider, ExtendedAIProvider {
    private readonly delay: number;
    private readonly defaultTokens: number;

    constructor(options?: { delay?: number; defaultTokens?: number }) {
        this.delay = options?.delay ?? 100;
        this.defaultTokens = options?.defaultTokens ?? 50;
    }

    /**
     * Generate deterministic text based on prompt keywords.
     * Routes to different mock responses based on content detection.
     */
    async generateText(prompt: string, options?: AIOptions): Promise<AIResponse<string>> {
        void options;
        const start = performance.now();
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        const response = this.buildDeterministicResponse(prompt);
        const latencyMs = Math.round(performance.now() - start);

        return {
            data: JSON.stringify(response),
            usage: {
                promptTokens: Math.floor(this.defaultTokens / 2),
                completionTokens: Math.ceil(this.defaultTokens / 2),
                totalTokens: this.defaultTokens,
            },
            model: 'mock-model',
            latencyMs,
            cached: false,
        };
    }

    /**
     * Generate a structured object by parsing the mock text response as JSON.
     * @throws {Error} If the mock response cannot be parsed as type T
     */
    async generateObject<T>(
        prompt: string,
        schema: Record<string, unknown>,
        options?: AIOptions,
    ): Promise<AIResponse<T>> {
        const res = await this.generateText(prompt, options);
        try {
            return {
                ...res,
                data: JSON.parse(res.data) as T,
            };
        } catch {
            throw new Error(`MOCK_PARSE_ERROR: Failed to parse mock response as JSON for prompt: "${prompt.slice(0, 50)}..."`);
        }
    }

    /**
     * Stream text character by character with small delays.
     * Useful for testing streaming consumers.
     */
    async *generateStream(prompt: string, options?: AIOptions): AsyncIterable<string> {
        const fullResponse = await this.generateText(prompt, options);
        const text = fullResponse.data;

        for (let i = 0; i < text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 5));
            yield text[i];
        }
    }

    /** Estimate token count using ~4 chars per token heuristic. */
    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /** Returns the mock model identifier. */
    getModelId(): string {
        return 'mock-model';
    }

    /**
     * Build a deterministic response object based on prompt keywords.
     * This is the core routing logic for mock responses.
     */
    private buildDeterministicResponse(prompt: string): Record<string, unknown> {
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('enhance') || lowerPrompt.includes('bullet')) {
            return {
                original: 'Did some work',
                enhanced: 'Engineered high-performance systems',
                explanation: 'Used stronger action verbs.',
            };
        }

        if (lowerPrompt.includes('tailor')) {
            return {
                tailoredSummary: 'Tailored summary for this job.',
                bulletSuggestions: [
                    {
                        original: 'Did some work',
                        tailored: 'Tailored work',
                        reasoning: 'Matches job description.',
                    },
                ],
                skillsToHighlight: ['React', 'TypeScript'],
                keywordsToAdd: ['Performance', 'Scaling'],
            };
        }

        if (lowerPrompt.includes('summary')) {
            return {
                summary: 'A highly motivated engineer.',
                alternatives: ['An experienced developer.', 'A passionate coder.'],
            };
        }

        if (lowerPrompt.includes('keyword') || lowerPrompt.includes('extract')) {
            return {
                hardSkills: ['TypeScript', 'React'],
                softSkills: ['Leadership'],
                tools: ['Git', 'Docker'],
                certifications: [],
                levels: [],
                locations: [],
            };
        }

        if (lowerPrompt.includes('skill') && lowerPrompt.includes('gap')) {
            return {
                missingSkills: ['Kubernetes'],
                missingKeywords: ['CI/CD'],
                levelMismatch: false,
                recommendations: ['Learn Kubernetes'],
            };
        }

        if (lowerPrompt.includes('job description') || lowerPrompt.includes('parse')) {
            return {
                title: 'Software Engineer',
                company: 'Tech Corp',
                location: 'Remote',
                type: 'Full-time',
                level: 'Senior',
                requirements: ['TypeScript', 'React'],
                responsibilities: ['Build features', 'Fix bugs'],
                keywords: {
                    hardSkills: ['TypeScript', 'React'],
                    softSkills: ['Leadership'],
                    tools: ['Git', 'Docker'],
                    certifications: [],
                    levels: [],
                    locations: [],
                },
            };
        }

        return { message: 'Generic response' };
    }
}
