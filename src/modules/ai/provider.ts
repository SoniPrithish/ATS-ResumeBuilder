import { AIProvider } from '@/types/ai';
import { ProviderName } from '@/modules/ai/types';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { GroqProvider } from '@/modules/ai/providers/groq';
import { MockAIProvider } from '@/modules/ai/providers/mock';

export function createAIProvider(name: ProviderName = 'gemini'): AIProvider {
    switch (name) {
        case 'gemini':
            return new GeminiProvider();
        case 'groq':
            return new GroqProvider();
        case 'mock':
            return new MockAIProvider();
        default:
            throw new Error(`UNKNOWN_PROVIDER: ${name}`);
    }
}

export class FallbackProvider implements AIProvider {
    private primary: AIProvider;
    private secondary: AIProvider;

    constructor(primary: AIProvider, secondary: AIProvider) {
        this.primary = primary;
        this.secondary = secondary;
    }

    async generateText(prompt: string, options?: any) {
        try {
            return await this.primary.generateText(prompt, options);
        } catch (error) {
            console.warn('Primary AI provider failed, falling back to secondary');
            return await this.secondary.generateText(prompt, options);
        }
    }

    async generateObject<T>(prompt: string, schema: Record<string, unknown>, options?: any) {
        try {
            return await this.primary.generateObject<T>(prompt, schema, options);
        } catch (error) {
            console.warn('Primary AI provider failed, falling back to secondary');
            return await this.secondary.generateObject<T>(prompt, schema, options);
        }
    }
}

export function createFallbackProvider(): AIProvider {
    return new FallbackProvider(createAIProvider('gemini'), createAIProvider('groq'));
}
