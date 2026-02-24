import type { AIProvider, AIOptions } from "@/types/ai";
import type { EnhancedBullet, SummaryResult, TailorResult } from "@/modules/ai/types";
import { estimateTokens, selectOptimalModel } from "@/modules/ai/token-budgeter";
import {
  buildBulletEnhancePrompt,
  type BulletEnhanceInput,
} from "@/modules/ai/prompts/bullet-enhance";
import {
  buildResumeTailorPrompt,
  type ResumeTailorInput,
} from "@/modules/ai/prompts/resume-tailor";
import {
  buildSummaryGeneratePrompt,
  type SummaryGenerateInput,
} from "@/modules/ai/prompts/summary-generate";
import {
  buildKeywordExtractPrompt,
  type KeywordExtractInput,
} from "@/modules/ai/prompts/keyword-extract";
import {
  buildSkillGapAnalyzePrompt,
  type SkillGapAnalyzeInput,
} from "@/modules/ai/prompts/skill-gap-analyze";

export interface KeywordExtractResult {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
  certifications: string[];
  levels: string[];
  locations: string[];
}

export interface SkillGapAnalysisResult {
  missingSkills: string[];
  missingKeywords: string[];
  levelMismatch: boolean;
  recommendations: string[];
}

export class AIOrchestrator {
  constructor(private readonly provider: AIProvider) {}

  private buildOptions(
    promptText: string,
    maxTokens: number,
    quality: "fast" | "balanced" | "high" = "balanced",
  ): AIOptions {
    const estimatedInput = estimateTokens(promptText);
    return {
      model: selectOptimalModel(estimatedInput, quality),
      maxTokens,
      temperature: quality === "high" ? 0.5 : 0.3,
    };
  }

  async enhanceBullet(input: string | BulletEnhanceInput): Promise<EnhancedBullet> {
    const payload =
      typeof input === "string" ? { bullet: input } : input;
    const template = buildBulletEnhancePrompt(payload);
    const response = await this.provider.generateObject<Partial<EnhancedBullet>>(
      template.userPrompt,
      {
        original: "string",
        enhanced: "string",
        explanation: "string",
      },
      this.buildOptions(template.userPrompt, template.maxTokens, "balanced"),
    );

    return {
      original: response.data.original ?? payload.bullet,
      enhanced: response.data.enhanced ?? payload.bullet,
      explanation:
        response.data.explanation ?? "Rewritten for stronger impact and clarity.",
    };
  }

  async enhanceBullets(bullets: string[]): Promise<EnhancedBullet[]> {
    return Promise.all(bullets.map((bullet) => this.enhanceBullet(bullet)));
  }

  async tailorResume(input: ResumeTailorInput): Promise<TailorResult> {
    const template = buildResumeTailorPrompt(input);
    const response = await this.provider.generateObject<Partial<TailorResult>>(
      template.userPrompt,
      {
        tailoredSummary: "string",
        bulletSuggestions: [
          {
            original: "string",
            tailored: "string",
            reasoning: "string",
          },
        ],
        skillsToHighlight: ["string"],
        keywordsToAdd: ["string"],
      },
      this.buildOptions(template.userPrompt, template.maxTokens, "high"),
    );

    return {
      tailoredSummary: response.data.tailoredSummary ?? input.summary,
      bulletSuggestions: Array.isArray(response.data.bulletSuggestions)
        ? response.data.bulletSuggestions
        : [],
      skillsToHighlight: Array.isArray(response.data.skillsToHighlight)
        ? response.data.skillsToHighlight
        : [],
      keywordsToAdd: Array.isArray(response.data.keywordsToAdd)
        ? response.data.keywordsToAdd
        : [],
    };
  }

  async generateSummary(input: SummaryGenerateInput): Promise<SummaryResult> {
    const template = buildSummaryGeneratePrompt(input);
    const response = await this.provider.generateObject<Partial<SummaryResult>>(
      template.userPrompt,
      {
        summary: "string",
        alternatives: ["string"],
      },
      this.buildOptions(template.userPrompt, template.maxTokens, "balanced"),
    );

    return {
      summary: response.data.summary ?? "",
      alternatives: Array.isArray(response.data.alternatives)
        ? response.data.alternatives
        : [],
    };
  }

  async extractKeywords(
    input: string | KeywordExtractInput,
  ): Promise<KeywordExtractResult> {
    const payload =
      typeof input === "string" ? { jobDescription: input } : input;
    const template = buildKeywordExtractPrompt(payload);
    const response = await this.provider.generateObject<Partial<KeywordExtractResult>>(
      template.userPrompt,
      {
        hardSkills: ["string"],
        softSkills: ["string"],
        tools: ["string"],
        certifications: ["string"],
        levels: ["string"],
        locations: ["string"],
      },
      this.buildOptions(template.userPrompt, template.maxTokens, "fast"),
    );

    return {
      hardSkills: Array.isArray(response.data.hardSkills)
        ? response.data.hardSkills
        : [],
      softSkills: Array.isArray(response.data.softSkills)
        ? response.data.softSkills
        : [],
      tools: Array.isArray(response.data.tools) ? response.data.tools : [],
      certifications: Array.isArray(response.data.certifications)
        ? response.data.certifications
        : [],
      levels: Array.isArray(response.data.levels) ? response.data.levels : [],
      locations: Array.isArray(response.data.locations)
        ? response.data.locations
        : [],
    };
  }

  async analyzeSkillGap(
    input: SkillGapAnalyzeInput,
  ): Promise<SkillGapAnalysisResult> {
    const template = buildSkillGapAnalyzePrompt(input);
    const response = await this.provider.generateObject<
      Partial<SkillGapAnalysisResult>
    >(
      template.userPrompt,
      {
        missingSkills: ["string"],
        missingKeywords: ["string"],
        levelMismatch: false,
        recommendations: ["string"],
      },
      this.buildOptions(template.userPrompt, template.maxTokens, "balanced"),
    );

    return {
      missingSkills: Array.isArray(response.data.missingSkills)
        ? response.data.missingSkills
        : [],
      missingKeywords: Array.isArray(response.data.missingKeywords)
        ? response.data.missingKeywords
        : [],
      levelMismatch: Boolean(response.data.levelMismatch),
      recommendations: Array.isArray(response.data.recommendations)
        ? response.data.recommendations
        : [],
    };
  }
}
