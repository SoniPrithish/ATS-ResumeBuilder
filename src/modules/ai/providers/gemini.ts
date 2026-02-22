import { generateText, streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { AIProvider, AIOptions, AIResponse } from '@/modules/ai/types';

export class GeminiProvider implements AIProvider {
    private model: string;

    constructor(model: string = 'gemini-1.5-flash') {
        this.model = model;
    }

    async generateText(prompt: string, options?: AIOptions): Promise<AIResponse<string>> {
        const maxRetries = 3;
        const baseDelay = 1000;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const start = performance.now();
                const { text, usage } = await generateText({
                    model: google(this.model),
                    system: (options as any)?.systemPrompt,
                    prompt: prompt,
                    maxTokens: options?.maxTokens ?? 2048,
                    temperature: options?.temperature ?? 0.7,
                });

                const latencyMs = Math.round(performance.now() - start);

                return {
                    data: text,
                    usage: {
                        promptTokens: usage.promptTokens || 0,
                        completionTokens: usage.completionTokens || 0,
                        totalTokens: usage.totalTokens || 0,
                    },
                    model: this.model,
                    latencyMs,
                    cached: false,
                };
            } catch (error: any) {
                const status = error?.statusCode || error?.status || error?.response?.status;

                if (status === 429) {
                    if (attempt === maxRetries) {
                        throw new Error('RATE_LIMITED');
                    }
                    const delay = baseDelay * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                } else if (status === 401) {
                    throw new Error('INVALID_API_KEY');
                }

                throw new Error(`AI_GENERATION_FAILED: ${error?.message || 'Unknown error'}`);
            }
        }

        throw new Error('AI_GENERATION_FAILED');
    }

    async generateObject<T>(prompt: string, schema: Record<string, unknown>, options?: AIOptions): Promise<AIResponse<T>> {
        const res = await this.generateText(prompt + '\n\nRespond with valid JSON matching exactly this schema:\n' + JSON.stringify(schema, null, 2), options);
        return {
            ...res,
            data: JSON.parse(res.data) as T,
        };
    }

    async *generateStream(prompt: string, options?: AIOptions): AsyncIterable<string> {
        const { textStream } = streamText({
            model: google(this.model),
            system: (options as any)?.systemPrompt,
            prompt: prompt,
            maxTokens: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
        });

        for await (const chunk of textStream) {
            yield chunk;
        }
    }

    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    getModelId(): string {
        return this.model;
    }
}
