/**
 * @module types/ai
 * @description Types for AI provider abstraction, generation requests,
 * and structured AI responses.
 */

/** Supported AI generation types */
export type AIGenerationType =
    | "resume_parse"
    | "resume_optimize"
    | "ats_analyze"
    | "jd_parse"
    | "cover_letter"
    | "bullet_rewrite"
    | "summary_generate"
    | "skills_suggest";

/** Configuration options for an AI generation request */
export interface AIOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    /** Whether to use cached results if available */
    useCache?: boolean;
    /** Cache TTL in seconds */
    cacheTtl?: number;
}

/** Token usage metrics from an AI response */
export interface AIUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

/** Structured AI response wrapper */
export interface AIResponse<T = string> {
    data: T;
    usage: AIUsage;
    model: string;
    latencyMs: number;
    cached: boolean;
}

/**
 * AI provider interface for abstracting over different AI backends.
 * Implementations should handle retries, rate limiting, and error handling.
 */
export interface AIProvider {
    /** Generate unstructured text */
    generateText(
        prompt: string,
        options?: AIOptions
    ): Promise<AIResponse<string>>;

    /** Generate structured data validated against a schema */
    generateObject<T>(
        prompt: string,
        schema: Record<string, unknown>,
        options?: AIOptions
    ): Promise<AIResponse<T>>;
}

/** AI generation record for tracking usage */
export interface AIGenerationRecord {
    id: string;
    userId: string;
    type: AIGenerationType;
    input: Record<string, unknown>;
    output: Record<string, unknown>;
    model: string;
    tokensUsed: number;
    latencyMs: number;
    cached: boolean;
    createdAt: Date;
}
