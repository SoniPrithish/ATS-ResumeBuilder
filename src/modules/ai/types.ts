import { ZodSchema } from 'zod';
export type { AIProvider, AIOptions, AIResponse, AIGenerationType } from '@/types/ai';

export interface PromptTemplate {
    systemPrompt: string;
    userPrompt: string;
    maxTokens: number;
    temperature: number;
    outputSchema?: ZodSchema<any>;
}

export interface BudgetResult {
    withinBudget: boolean;
    estimatedInputTokens: number;
    maxOutputTokens: number;
    estimatedTotal: number;
    limit: number;
    recommendation: string;
}

export interface ModelLimits {
    inputLimit: number;
    outputLimit: number;
    requestsPerMinute: number;
    costPer1kTokens: number;
}

export interface EnhancedBullet {
    original: string;
    enhanced: string;
    explanation: string;
}

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

export interface SummaryResult {
    summary: string;
    alternatives: string[];
}

export type ProviderName = 'gemini' | 'groq' | 'mock';
