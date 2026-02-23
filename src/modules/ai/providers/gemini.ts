import { generateText as aiGenerateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import type { AIProvider, AIOptions, AIResponse } from '@/types/ai';
import type { ExtendedAIProvider, ExtendedAIOptions } from '@/modules/ai/types';
import { withRetry } from '@/modules/ai/utils';

/**
 * GeminiProvider — Google Gemini AI provider using the Vercel AI SDK.
 *
 * Features:
 * - Automatic retry with exponential backoff on 429 rate limits
 * - Structured error handling (RATE_LIMITED, INVALID_API_KEY, AI_GENERATION_FAILED)
 * - Latency measurement via performance.now()
 * - Streaming support via Vercel AI SDK streamText
 */
export class GeminiProvider implements AIProvider, ExtendedAIProvider {
    private readonly model: string;

    constructor(model: string = 'gemini-1.5-flash') {
        this.model = model;
    }

    /**
     * Generate text using Google Gemini with retry logic.
     * Retries up to 3 times with 1s/2s/4s exponential backoff on 429 errors.
     */
    async generateText(prompt: string, options?: AIOptions): Promise<AIResponse<string>> {
        const extOptions = options as AIOptions & ExtendedAIOptions | undefined;

        return withRetry(async () => {
            const start = performance.now();
            const request = {
                model: google(this.model),
                system: extOptions?.systemPrompt,
                prompt,
                maxTokens: options?.maxTokens ?? 2048,
                temperature: options?.temperature ?? 0.7,
            } as unknown as Parameters<typeof aiGenerateText>[0];
            const { text, usage } = await aiGenerateText(request);
            const usageRecord = usage as {
                inputTokens?: number;
                outputTokens?: number;
                promptTokens?: number;
                completionTokens?: number;
                totalTokens?: number;
            } | undefined;

            const latencyMs = Math.round(performance.now() - start);

            return {
                data: text,
                usage: {
                    promptTokens: usageRecord?.inputTokens ?? usageRecord?.promptTokens ?? 0,
                    completionTokens: usageRecord?.outputTokens ?? usageRecord?.completionTokens ?? 0,
                    totalTokens: usageRecord?.totalTokens ?? 0,
                },
                model: this.model,
                latencyMs,
                cached: false,
            };
        }, 3, 1000, 'gemini');
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
     * Stream text deltas using the Vercel AI SDK streamText function.
     * Yields chunks as they arrive from the API.
     */
    async *generateStream(prompt: string, options?: AIOptions): AsyncIterable<string> {
        const extOptions = options as AIOptions & ExtendedAIOptions | undefined;

        const request = {
            model: google(this.model),
            system: extOptions?.systemPrompt,
            prompt,
            maxTokens: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
        } as unknown as Parameters<typeof streamText>[0];
        const { textStream } = streamText(request);

        for await (const chunk of textStream) {
            yield chunk;
        }
    }

    /** Estimate token count using ~4 chars per token heuristic. */
    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /** Returns the Gemini model identifier. */
    getModelId(): string {
        return this.model;
    }
}
