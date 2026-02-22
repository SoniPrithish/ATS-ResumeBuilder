import { AIProvider, AIOptions, AIResponse } from '@/modules/ai/types';

export class MockAIProvider implements AIProvider {
    private delay: number;
    private defaultTokens: number;

    constructor(options?: { delay?: number; defaultTokens?: number }) {
        this.delay = options?.delay ?? 100;
        this.defaultTokens = options?.defaultTokens ?? 50;
    }

    async generateText(prompt: string, options: AIOptions): Promise<AIResponse> {
        const start = performance.now();
        await new Promise((resolve) => setTimeout(resolve, this.delay));

        let response: any;
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('enhance') || lowerPrompt.includes('bullet')) {
            response = {
                original: 'Did some work',
                enhanced: 'Engineered high-performance systems',
                explanation: 'Used stronger action verbs.',
            };
        } else if (lowerPrompt.includes('tailor')) {
            response = {
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
        } else if (lowerPrompt.includes('summary')) {
            response = {
                summary: 'A highly motivated engineer.',
                alternatives: ['An experienced developer.', 'A passionate coder.'],
            };
        } else if (lowerPrompt.includes('keyword') || lowerPrompt.includes('extract')) {
            response = {
                hardSkills: ['TypeScript', 'React'],
                softSkills: ['Leadership'],
                tools: ['Git', 'Docker'],
                certifications: [],
                levels: [],
                locations: [],
            };
        } else if (lowerPrompt.includes('skill') && lowerPrompt.includes('gap')) {
            response = {
                missingSkills: ['Kubernetes'],
                missingKeywords: ['CI/CD'],
                levelMismatch: false,
                recommendations: ['Learn Kubernetes'],
            };
        } else if (lowerPrompt.includes('job description') || lowerPrompt.includes('parse')) {
            response = {
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
        } else {
            response = { message: 'Generic response' };
        }

        const latencyMs = Math.round(performance.now() - start);

        return {
            text: JSON.stringify(response),
            tokensUsed: this.defaultTokens,
            model: 'mock-model',
            latencyMs,
            cached: false,
        };
    }

    async *generateStream(prompt: string, options: AIOptions): AsyncIterable<string> {
        const fullResponse = await this.generateText(prompt, options);
        const text = fullResponse.text;

        for (let i = 0; i < text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 5));
            yield text[i];
        }
    }

    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    getModelId(): string {
        return 'mock-model';
    }
}
