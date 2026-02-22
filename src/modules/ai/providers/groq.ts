import { AIProvider, AIOptions, AIResponse } from '@/modules/ai/types';

export class GroqProvider implements AIProvider {
    private model: string;
    private apiKey: string;

    constructor(model: string = 'llama-3.1-8b-instant') {
        this.model = model;
        this.apiKey = process.env.GROQ_API_KEY || '';
    }

    async generateText(prompt: string, options?: AIOptions): Promise<AIResponse<string>> {
        const maxRetries = 3;
        const baseDelay = 1000;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const start = performance.now();

                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: this.model,
                        messages: [
                            ...(options && (options as any).systemPrompt ? [{ role: 'system', content: (options as any).systemPrompt }] : []),
                            { role: 'user', content: prompt }
                        ],
                        max_tokens: options?.maxTokens ?? 2048,
                        temperature: options?.temperature ?? 0.7,
                    })
                });

                if (!res.ok) {
                    const errorBody = await res.text().catch(() => '');
                    throw Object.assign(new Error(`Groq API Error: ${res.status} ${res.statusText}`), {
                        statusCode: res.status,
                        body: errorBody
                    });
                }

                const data = await res.json();
                const latencyMs = Math.round(performance.now() - start);

                return {
                    data: data.choices?.[0]?.message?.content || '',
                    usage: {
                        promptTokens: data.usage?.prompt_tokens || 0,
                        completionTokens: data.usage?.completion_tokens || 0,
                        totalTokens: data.usage?.total_tokens || 0,
                    },
                    model: this.model,
                    latencyMs,
                    cached: false,
                };
            } catch (error: any) {
                const status = error?.statusCode;

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
        const fullResponse = await this.generateText(prompt, options);
        const text = fullResponse.data;

        for (let i = 0; i < text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 5));
            yield text[i];
        }
    }

    estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    getModelId(): string {
        return this.model;
    }
}
