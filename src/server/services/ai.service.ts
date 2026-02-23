import { db } from "@/server/lib/db";
import { logger } from "@/server/lib/logger";
import { createAIProvider, createFallbackProvider } from "@/modules/ai/provider";
import type { Prisma } from "@prisma/client";
import type { AIProvider } from "@/types/ai";
import type { ServiceResult } from "@/types/common";

export interface EnhanceBulletInput {
  bullet: string;
}

export interface EnhanceBulletResult {
  original: string;
  enhanced: string;
  explanation: string;
}

export interface GenerateSummaryInput {
  resumeData: {
    title?: string;
    experience?: unknown[];
    skills?: Record<string, unknown>;
  };
}

export interface GenerateSummaryResult {
  summary: string;
  alternatives: string[];
}

export interface TailorResumeInput {
  resumeId: string;
  jobId: string;
}

export interface TailorResumeResult {
  summary: {
    original: string;
    suggested: string;
  };
  bullets: Array<{
    id: string;
    original: string;
    suggested: string;
  }>;
  keywords: {
    missing: string[];
  };
}

function getProvider(): AIProvider {
  if (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GROQ_API_KEY
  ) {
    return createFallbackProvider();
  }
  return createAIProvider("mock");
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === "string");
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function extractExperienceBullets(experience: unknown[] | undefined): string[] {
  if (!experience) return [];
  const bullets: string[] = [];
  for (const entry of experience) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const entryBullets = asStringArray(record.bullets);
    bullets.push(...entryBullets);
  }
  return bullets;
}

function extractResumeBulletsFromJson(experienceJson: unknown): string[] {
  if (!Array.isArray(experienceJson)) return [];
  const bullets: string[] = [];
  for (const entry of experienceJson) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const values = asStringArray(record.bullets);
    bullets.push(...values);
  }
  return bullets;
}

const provider = getProvider();

export const aiService = {
  async enhanceBullet(
    userId: string,
    input: EnhanceBulletInput
  ): Promise<ServiceResult<EnhanceBulletResult>> {
    try {
      const response = await provider.generateObject<{
        enhanced?: string;
        explanation?: string;
      }>(
        [
          "Improve this resume bullet into a stronger, concise achievement statement.",
          "Keep it professional, ATS-friendly, and quantifiable when possible.",
          `Bullet: ${input.bullet}`,
        ].join("\n"),
        {
          enhanced: "string",
          explanation: "string",
        },
        {
          temperature: 0.4,
          maxTokens: 256,
        }
      );

      const result: EnhanceBulletResult = {
        original: input.bullet,
        enhanced: asString(response.data.enhanced, input.bullet),
        explanation: asString(
          response.data.explanation,
          "Rewritten for stronger impact and clarity."
        ),
      };

      await db.aIGeneration.create({
        data: {
          userId,
          type: "BULLET_REWRITE",
          input: toInputJson({ bullet: input.bullet }),
          output: toInputJson(result),
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          latencyMs: response.latencyMs,
          cached: response.cached,
        },
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error({ err: error, userId }, "AI bullet enhancement failed");
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI bullet enhancement failed",
      };
    }
  },

  async generateSummary(
    userId: string,
    input: GenerateSummaryInput
  ): Promise<ServiceResult<GenerateSummaryResult>> {
    try {
      const bullets = extractExperienceBullets(input.resumeData.experience).slice(0, 8);
      const skills = Object.entries(input.resumeData.skills ?? {})
        .flatMap(([, value]) => asStringArray(value))
        .slice(0, 20);

      const response = await provider.generateObject<{
        summary?: string;
        alternatives?: string[];
      }>(
        [
          "Write a concise professional resume summary (2-4 sentences).",
          `Role context: ${asString(input.resumeData.title, "Software Professional")}`,
          `Experience bullets: ${bullets.join(" | ")}`,
          `Skills: ${skills.join(", ")}`,
        ].join("\n"),
        {
          summary: "string",
          alternatives: ["string"],
        },
        {
          temperature: 0.5,
          maxTokens: 320,
        }
      );

      const result: GenerateSummaryResult = {
        summary: asString(
          response.data.summary,
          "Experienced professional with a proven track record of delivering high-impact outcomes."
        ),
        alternatives: asStringArray(response.data.alternatives),
      };

      await db.aIGeneration.create({
        data: {
          userId,
          type: "SUMMARY_GENERATE",
          input: toInputJson(input),
          output: toInputJson(result),
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          latencyMs: response.latencyMs,
          cached: response.cached,
        },
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error({ err: error, userId }, "AI summary generation failed");
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI summary generation failed",
      };
    }
  },

  async tailorResume(
    userId: string,
    input: TailorResumeInput
  ): Promise<ServiceResult<TailorResumeResult>> {
    try {
      const [resume, job] = await Promise.all([
        db.resume.findUnique({ where: { id: input.resumeId } }),
        db.jobDescription.findUnique({ where: { id: input.jobId } }),
      ]);

      if (!resume || resume.userId !== userId) {
        return { success: false, error: "Resume not found" };
      }

      if (!job || job.userId !== userId) {
        return { success: false, error: "Job description not found" };
      }

      const originalSummary = resume.summary ?? "";
      const existingBullets = extractResumeBulletsFromJson(resume.experience).slice(0, 10);

      const response = await provider.generateObject<{
        tailoredSummary?: string;
        bulletSuggestions?: Array<{
          original?: string;
          tailored?: string;
        }>;
        keywordsToAdd?: string[];
      }>(
        [
          "Tailor this resume to the given job description.",
          `Resume summary: ${originalSummary}`,
          `Resume bullets: ${existingBullets.join(" | ")}`,
          `Job title: ${job.title}`,
          `Job company: ${job.company}`,
          `Job description: ${job.rawText}`,
        ].join("\n"),
        {
          tailoredSummary: "string",
          bulletSuggestions: [
            {
              original: "string",
              tailored: "string",
            },
          ],
          keywordsToAdd: ["string"],
        },
        {
          temperature: 0.4,
          maxTokens: 1200,
        }
      );

      const suggestionRows = Array.isArray(response.data.bulletSuggestions)
        ? response.data.bulletSuggestions
        : [];

      const bullets = suggestionRows.map((item, index) => ({
        id: `ai-bullet-${index + 1}`,
        original: asString(item.original, existingBullets[index] ?? ""),
        suggested: asString(item.tailored, existingBullets[index] ?? ""),
      }));

      const result: TailorResumeResult = {
        summary: {
          original: originalSummary,
          suggested: asString(response.data.tailoredSummary, originalSummary),
        },
        bullets,
        keywords: {
          missing: asStringArray(response.data.keywordsToAdd),
        },
      };

      await db.aIGeneration.create({
        data: {
          userId,
          type: "RESUME_OPTIMIZE",
          input: toInputJson(input),
          output: toInputJson(result),
          model: response.model,
          tokensUsed: response.usage.totalTokens,
          latencyMs: response.latencyMs,
          cached: response.cached,
        },
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error({ err: error, userId }, "AI tailoring failed");
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI tailoring failed",
      };
    }
  },
};
