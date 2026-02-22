import type { ZodSchema } from 'zod';
export type { AIProvider, AIOptions, AIResponse, AIGenerationType, AIUsage } from '@/types/ai';

/**
 * Extended AI provider interface that adds streaming, token estimation,
 * and model identification on top of the base AIProvider contract.
 */
export interface ExtendedAIProvider {
    /** Stream text deltas for a given prompt */
    generateStream(prompt: string, options?: import('@/types/ai').AIOptions): AsyncIterable<string>;

    /** Estimate the number of tokens in a text string */
    estimateTokens(text: string): number;

    /** Get the model identifier for this provider instance */
    getModelId(): string;
}

/**
 * Extended options that providers may accept beyond the base AIOptions.
 * Providers cast to this internally when they need system prompts.
 */
export interface ExtendedAIOptions {
    /** System prompt to set model behavior/persona */
    systemPrompt?: string;
}

/**
 * Template for structured prompt construction.
 */
export interface PromptTemplate {
    systemPrompt: string;
    userPrompt: string;
    maxTokens: number;
    temperature: number;
    outputSchema?: ZodSchema<any>;
}

/**
 * Result of a token budget estimation check.
 */
export interface BudgetResult {
    withinBudget: boolean;
    estimatedInputTokens: number;
    maxOutputTokens: number;
    estimatedTotal: number;
    limit: number;
    recommendation: string;
}

/**
 * Model-specific limits for budget calculations.
 */
export interface ModelLimits {
    inputLimit: number;
    outputLimit: number;
    requestsPerMinute: number;
    costPer1kTokens: number;
}

/**
 * Result of an AI-enhanced resume bullet point.
 */
export interface EnhancedBullet {
    original: string;
    enhanced: string;
    explanation: string;
}

/**
 * Result of AI-tailored resume content for a specific job.
 */
export interface TailorResult {
    tailoredSummary: string;
    bulletSuggestions: Array<{
        original: string;
        tailored: string;
        reasoning: string;
    }>;
    skillsToHighlight: string[];
    keywordsToAdd: string[];
}

/**
 * Result of AI-generated professional summary.
 */
export interface SummaryResult {
    summary: string;
    alternatives: string[];
}

/** Supported AI provider names for the factory */
export type ProviderName = 'gemini' | 'groq' | 'mock';
