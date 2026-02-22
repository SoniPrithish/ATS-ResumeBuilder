import type { AIProvider, AIOptions } from '@/types/ai';
import type { ProviderName } from '@/modules/ai/types';
import { GeminiProvider } from '@/modules/ai/providers/gemini';
import { GroqProvider } from '@/modules/ai/providers/groq';
import { MockAIProvider } from '@/modules/ai/providers/mock';
import { AIProviderError, AI_ERROR_CODES } from '@/modules/ai/utils';

/**
 * Factory function to create an AI provider by name.
 *
 * @param name - The provider name ('gemini' | 'groq' | 'mock')
 * @returns An initialized AIProvider instance
 * @throws {AIProviderError} If the provider name is not recognized
 */
export function createAIProvider(name: ProviderName = 'gemini'): AIProvider {
    switch (name) {
        case 'gemini':
            return new GeminiProvider();
        case 'groq':
            return new GroqProvider();
        case 'mock':
            return new MockAIProvider();
        default:
            throw new AIProviderError(
                AI_ERROR_CODES.UNKNOWN_PROVIDER,
                `Unknown provider: "${name}"`,
                String(name),
            );
    }
}

/**
 * FallbackProvider — wraps two providers, trying the primary first
 * and falling back to the secondary on any error.
 *
 * Logs warnings with the actual error for debugging when fallback occurs.
 */
export class FallbackProvider implements AIProvider {
    private readonly primary: AIProvider;
    private readonly secondary: AIProvider;

    constructor(primary: AIProvider, secondary: AIProvider) {
        this.primary = primary;
        this.secondary = secondary;
    }

    /** Generate text, falling back to secondary on primary failure. */
    async generateText(prompt: string, options?: AIOptions) {
        try {
            return await this.primary.generateText(prompt, options);
        } catch (primaryError) {
            console.warn(
                'Primary AI provider failed, falling back to secondary.',
                primaryError instanceof Error ? primaryError.message : primaryError,
            );
            try {
                return await this.secondary.generateText(prompt, options);
            } catch (secondaryError) {
                console.error(
                    'Secondary AI provider also failed.',
                    secondaryError instanceof Error ? secondaryError.message : secondaryError,
                );
                throw secondaryError;
            }
        }
    }

    /** Generate structured object, falling back to secondary on primary failure. */
    async generateObject<T>(prompt: string, schema: Record<string, unknown>, options?: AIOptions) {
        try {
            return await this.primary.generateObject<T>(prompt, schema, options);
        } catch (primaryError) {
            console.warn(
                'Primary AI provider failed for generateObject, falling back to secondary.',
                primaryError instanceof Error ? primaryError.message : primaryError,
            );
            try {
                return await this.secondary.generateObject<T>(prompt, schema, options);
            } catch (secondaryError) {
                console.error(
                    'Secondary AI provider also failed for generateObject.',
                    secondaryError instanceof Error ? secondaryError.message : secondaryError,
                );
                throw secondaryError;
            }
        }
    }
}

/**
 * Create a provider that tries Gemini first, then falls back to Groq.
 * @returns A FallbackProvider with Gemini as primary and Groq as secondary
 */
export function createFallbackProvider(): AIProvider {
    return new FallbackProvider(
        createAIProvider('gemini'),
        createAIProvider('groq'),
    );
}
