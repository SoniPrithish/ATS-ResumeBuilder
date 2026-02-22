/**
 * @module server/services/ats.service
 * @description ATS scoring service with caching layer.
 * Provides scoreResume, getScore, and compareScores operations.
 */

import { db } from "@/server/lib/db";
import { createChildLogger } from "@/server/lib/logger";
import { cacheService, CACHE_TTL } from "@/server/services/cache.service";
import { calculateATSScoreWithFileType } from "@/modules/ats";
import type { ATSScore } from "@/types/ats";
import type { CanonicalResume, SkillSet } from "@/types/resume";
import type { ServiceResult } from "@/types/common";

const log = createChildLogger("ats-service");

/** Cache key builder for ATS scores */
function cacheKey(resumeId: string): string {
    return `ats:score:${resumeId}`;
}

/**
 * ATS scoring service with caching and database persistence.
 */
export const atsService = {
    /**
     * Score a resume by ID with optional JD keywords.
     * Checks cache first, then calculates and persists.
     */
    async scoreResume(
        resumeId: string,
        userId: string,
        targetKeywords?: string[]
    ): Promise<ServiceResult<ATSScore>> {
        try {
            // 1. Fetch resume from DB
            const resume = await db.resume.findUnique({
                where: { id: resumeId },
            });

            if (!resume) {
                return {
                    success: false,
                    error: "Resume not found",
                    code: "NOT_FOUND",
                };
            }

            // Auth check
            const record = resume as Record<string, unknown>;
            if (record.userId !== userId) {
                return {
                    success: false,
                    error: "Resume not found",
                    code: "NOT_FOUND",
                };
            }

            // 2. Check cache (only if no target keywords — JD scoring is not cached)
            if (!targetKeywords) {
                const cached = await cacheService.get<ATSScore>(cacheKey(resumeId));
                if (cached) {
                    log.info({ resumeId }, "ATS score returned from cache");
                    return { success: true, data: cached };
                }
            }

            // 3. Build CanonicalResume from DB fields
            const canonical = buildCanonicalResume(record);

            // 4. Calculate score
            const fileType = (record.originalFileType as string) ?? null;
            const score = calculateATSScoreWithFileType(
                canonical,
                fileType,
                targetKeywords
            );

            // 5. Update DB
            await db.resume.update({
                where: { id: resumeId },
                data: {
                    lastAtsScore: score.overallScore,
                    lastAtsDetails: score as unknown as Record<string, unknown>,
                } as never,
            });

            // 6. Cache the score (24h TTL)
            await cacheService.set(cacheKey(resumeId), score, CACHE_TTL.ATS_SCORE);

            log.info(
                { resumeId, overallScore: score.overallScore },
                "ATS score calculated and cached"
            );

            return { success: true, data: score };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            log.error({ resumeId, userId, error: message }, "Failed to score resume");
            return {
                success: false,
                error: `Failed to score resume: ${message}`,
                code: "SCORING_FAILED",
            };
        }
    },

    /**
     * Get a previously calculated ATS score.
     * Checks cache first, then falls back to DB.
     */
    async getScore(
        resumeId: string,
        userId: string
    ): Promise<ServiceResult<ATSScore | null>> {
        try {
            // Check cache
            const cached = await cacheService.get<ATSScore>(cacheKey(resumeId));
            if (cached) {
                return { success: true, data: cached };
            }

            // Fetch from DB
            const resume = await db.resume.findUnique({
                where: { id: resumeId },
            });

            if (!resume) {
                return {
                    success: false,
                    error: "Resume not found",
                    code: "NOT_FOUND",
                };
            }

            const record = resume as Record<string, unknown>;
            if (record.userId !== userId) {
                return {
                    success: false,
                    error: "Resume not found",
                    code: "NOT_FOUND",
                };
            }

            const scoreData = record.lastAtsDetails as ATSScore | null;
            return { success: true, data: scoreData ?? null };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            log.error(
                { resumeId, userId, error: message },
                "Failed to get ATS score"
            );
            return {
                success: false,
                error: `Failed to get ATS score: ${message}`,
                code: "GET_SCORE_FAILED",
            };
        }
    },

    /**
     * Compare ATS scores across multiple resumes.
     */
    async compareScores(
        resumeIds: string[],
        userId: string
    ): Promise<ServiceResult<ATSScore[]>> {
        try {
            const scores: ATSScore[] = [];

            for (const resumeId of resumeIds) {
                const result = await atsService.getScore(resumeId, userId);
                if (!result.success) {
                    return {
                        success: false,
                        error: result.error,
                        code: "code" in result ? result.code : "COMPARE_FAILED",
                    };
                }

                if (!result.data) {
                    // If no score exists, calculate it
                    const scoreResult = await atsService.scoreResume(resumeId, userId);
                    if (!scoreResult.success) {
                        return {
                            success: false,
                            error: scoreResult.error,
                            code: "code" in scoreResult ? scoreResult.code : "COMPARE_FAILED",
                        };
                    }
                    scores.push(scoreResult.data);
                } else {
                    scores.push(result.data);
                }
            }

            return { success: true, data: scores };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            log.error({ resumeIds, userId, error: message }, "Failed to compare scores");
            return {
                success: false,
                error: `Failed to compare scores: ${message}`,
                code: "COMPARE_FAILED",
            };
        }
    },
};

// ── Helpers ────────────────────────────────────────────────

/**
 * Build a CanonicalResume from a Prisma resume record.
 */
function buildCanonicalResume(
    record: Record<string, unknown>
): CanonicalResume {
    const contactInfo = (record.contactInfo as Record<string, unknown>) ?? {};
    const skills = (record.skills as Record<string, unknown>) ?? {};

    return {
        contactInfo: {
            fullName: (contactInfo.fullName as string) ?? "",
            email: (contactInfo.email as string) ?? "",
            phone: contactInfo.phone as string | undefined,
            location: contactInfo.location as string | undefined,
            linkedin: contactInfo.linkedin as string | undefined,
            github: contactInfo.github as string | undefined,
            website: contactInfo.website as string | undefined,
            portfolio: contactInfo.portfolio as string | undefined,
        },
        summary: (record.summary as string) ?? undefined,
        experience:
            ((record.experience as unknown[]) ?? []).map((exp) => {
                const e = exp as Record<string, unknown>;
                return {
                    id: (e.id as string) ?? "",
                    company: (e.company as string) ?? "",
                    title: (e.title as string) ?? "",
                    location: e.location as string | undefined,
                    startDate: (e.startDate as string) ?? "",
                    endDate: e.endDate as string | undefined,
                    current: (e.current as boolean) ?? false,
                    bullets: (e.bullets as string[]) ?? [],
                    technologies: e.technologies as string[] | undefined,
                };
            }),
        education:
            ((record.education as unknown[]) ?? []).map((edu) => {
                const e = edu as Record<string, unknown>;
                return {
                    id: (e.id as string) ?? "",
                    institution: (e.institution as string) ?? "",
                    degree: (e.degree as string) ?? "",
                    field: (e.field as string) ?? "",
                    startDate: (e.startDate as string) ?? "",
                    endDate: e.endDate as string | undefined,
                    gpa: e.gpa as string | undefined,
                    honors: e.honors as string[] | undefined,
                    coursework: e.coursework as string[] | undefined,
                };
            }),
        skills: {
            technical: (skills.technical as string[]) ?? [],
            soft: (skills.soft as string[]) ?? [],
            tools: (skills.tools as string[]) ?? [],
            languages: skills.languages as string[] | undefined,
            certifications: skills.certifications as string[] | undefined,
        } as SkillSet,
        projects: record.projects
            ? ((record.projects as unknown[]).map((p) => {
                const proj = p as Record<string, unknown>;
                return {
                    id: (proj.id as string) ?? "",
                    name: (proj.name as string) ?? "",
                    description: (proj.description as string) ?? "",
                    url: proj.url as string | undefined,
                    technologies: (proj.technologies as string[]) ?? [],
                    highlights: proj.highlights as string[] | undefined,
                };
            }))
            : undefined,
        certifications: record.certifications
            ? ((record.certifications as unknown[]).map((c) => {
                const cert = c as Record<string, unknown>;
                return {
                    id: (cert.id as string) ?? "",
                    name: (cert.name as string) ?? "",
                    issuer: (cert.issuer as string) ?? "",
                    date: (cert.date as string) ?? "",
                    expirationDate: cert.expirationDate as string | undefined,
                    credentialId: cert.credentialId as string | undefined,
                    url: cert.url as string | undefined,
                };
            }))
            : undefined,
    };
}
