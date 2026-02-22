import type { AIProvider, AIOptions, AIResponse } from '@/types/ai';
import type { ExtendedAIProvider, ExtendedAIOptions } from '@/modules/ai/types';
import { withRetry } from '@/modules/ai/utils';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * GroqProvider — Groq AI provider using direct fetch to their OpenAI-compatible API.
 *
 * Features:
 * - Uses Groq's OpenAI-compatible REST endpoint (no extra SDK needed)
 * - Automatic retry with exponential backoff on 429 rate limits
 * - Structured error handling (RATE_LIMITED, INVALID_API_KEY, AI_GENERATION_FAILED)
 * - Latency measurement via performance.now()
 *
 * Note: generateStream currently fetches the full response and yields char-by-char.
 * For production streaming, consider using the `stream: true` SSE option.
 */
export class GroqProvider implements AIProvider, ExtendedAIProvider {
    private readonly model: string;
    private readonly apiKey: string;

    constructor(model: string = 'llama-3.1-8b-instant') {
        this.model = model;
        const key = process.env.GROQ_API_KEY;
        if (!key) {
            console.warn(
                'GroqProvider: GROQ_API_KEY environment variable is not set. ' +
                'API calls will fail with 401. Set it before making requests.',
            );
        }
        this.apiKey = key ?? '';
    }

    /**
     * Generate text using Groq's OpenAI-compatible endpoint with retry logic.
     * Retries up to 3 times with 1s/2s/4s exponential backoff on 429 errors.
     */
    async generateText(prompt: string, options?: AIOptions): Promise<AIResponse<string>> {
        const extOptions = options as AIOptions & ExtendedAIOptions | undefined;

        return withRetry(async () => {
            const start = performance.now();

            const messages = [
                ...(extOptions?.systemPrompt
                    ? [{ role: 'system' as const, content: extOptions.systemPrompt }]
                    : []),
                { role: 'user' as const, content: prompt },
            ];

            const res = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    max_tokens: options?.maxTokens ?? 2048,
                    temperature: options?.temperature ?? 0.7,
                }),
            });

            if (!res.ok) {
                const errorBody = await res.text().catch(() => '');
                throw Object.assign(
                    new Error(`Groq API Error: ${res.status} ${res.statusText} — ${errorBody}`),
                    { statusCode: res.status },
                );
            }

            const data = await res.json();
            const latencyMs = Math.round(performance.now() - start);

            return {
                data: data.choices?.[0]?.message?.content ?? '',
                usage: {
                    promptTokens: data.usage?.prompt_tokens ?? 0,
                    completionTokens: data.usage?.completion_tokens ?? 0,
                    totalTokens: data.usage?.total_tokens ?? 0,
                },
                model: this.model,
                latencyMs,
                cached: false,
            };
        }, 3, 1000, 'groq');
    }

    /**
     * Generate a structured object by appending schema instructions to the prompt
     * and parsing the response as JSON.
     * @throws {Error} If the response cannot be parsed as valid JSON
     */
    async generateObject<T>(
        prompt: string,
        schema: Record<string, unknown>,
        options?: AIOptions,
    ): Promise<AIResponse<T>> {
        const schemaText = JSON.stringify(schema, null, 2);
        const res = await this.generateText(
            `${prompt}\n\nRespond with valid JSON matching exactly this schema:\n${schemaText}`,
            options,
        );
        return {
            ...res,
            data: JSON.parse(res.data) as T,
        };
    }

    /**
     * Stream text character by character from a full response.
     *
     * Note: This is a simulated stream. For true SSE streaming, the fetch call
     * should use `stream: true` and parse Server-Sent Events.
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

    /** Returns the Groq model identifier. */
    getModelId(): string {
        return this.model;
    }
}
