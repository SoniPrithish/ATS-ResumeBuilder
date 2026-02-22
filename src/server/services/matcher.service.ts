import type { JobDescription, MatchResult as PrismaMatchResult } from "@prisma/client";
import { db } from "@/server/lib/db";
import { createChildLogger } from "@/server/lib/logger";
import { cacheService, CACHE_TTL } from "@/server/services/cache.service";
import { generateMatchReport, parseJobDescription } from "@/modules/matcher";
import type { MatchReport } from "@/modules/matcher/types";
import type { PaginatedResult, ServiceResult } from "@/types/common";
import type { CanonicalResume } from "@/types/resume";
import type { ParsedJobDescription } from "@/types/job";

const log = createChildLogger("matcher-service");

function buildCanonicalResume(record: Record<string, unknown>): CanonicalResume {
    return {
        contactInfo: (record.contactInfo as CanonicalResume["contactInfo"]) ?? { fullName: "", email: "" },
        summary: (record.summary as string | undefined) ?? undefined,
        experience: (record.experience as CanonicalResume["experience"]) ?? [],
        education: (record.education as CanonicalResume["education"]) ?? [],
        skills: (record.skills as CanonicalResume["skills"]) ?? { technical: [], soft: [], tools: [] },
        projects: (record.projects as CanonicalResume["projects"]) ?? [],
        certifications: (record.certifications as CanonicalResume["certifications"]) ?? [],
        customSections: (record.customSections as CanonicalResume["customSections"]) ?? [],
    };
}

function cacheKey(resumeId: string, jdId: string): string {
    return `match:${resumeId}:${jdId}`;
}

export const matcherService = {
    async matchResumeToJD(resumeId: string, jdId: string, userId: string): Promise<ServiceResult<MatchReport>> {
        try {
            const resume = await db.resume.findUnique({ where: { id: resumeId } });
            if (!resume || (resume as Record<string, unknown>).userId !== userId) {
                return { success: false, error: "Resume not found", code: "NOT_FOUND" };
            }

            const jd = await db.jobDescription.findUnique({ where: { id: jdId } });
            if (!jd || jd.userId !== userId) {
                return { success: false, error: "Job description not found", code: "NOT_FOUND" };
            }

            const cached = await cacheService.get<MatchReport>(cacheKey(resumeId, jdId));
            if (cached) {
                return { success: true, data: cached };
            }

            const canonicalResume = buildCanonicalResume(resume as unknown as Record<string, unknown>);
            let parsedJD = (jd.parsedData as ParsedJobDescription | null) ?? null;
            if (!parsedJD) {
                parsedJD = parseJobDescription(jd.rawText);
                await db.jobDescription.update({
                    where: { id: jd.id },
                    data: { parsedData: parsedJD as never },
                });
            }

            const report = generateMatchReport(canonicalResume, parsedJD);

            await db.matchResult.upsert({
                where: {
                    resumeId_jobDescriptionId: {
                        resumeId,
                        jobDescriptionId: jdId,
                    },
                },
                update: {
                    overallScore: Math.round(report.overallScore),
                    keywordScore: Math.round(report.keywordScore),
                    skillsScore: Math.round(report.skillCoverageScore),
                    experienceScore: Math.round(report.experienceRelevanceScore),
                    matchedKeywords: report.matchedKeywords as never,
                    missingKeywords: report.missingKeywords as never,
                    skillGaps: report.skillGaps as never,
                    suggestions: report.suggestions as never,
                },
                create: {
                    resumeId,
                    jobDescriptionId: jdId,
                    overallScore: Math.round(report.overallScore),
                    keywordScore: Math.round(report.keywordScore),
                    skillsScore: Math.round(report.skillCoverageScore),
                    experienceScore: Math.round(report.experienceRelevanceScore),
                    matchedKeywords: report.matchedKeywords as never,
                    missingKeywords: report.missingKeywords as never,
                    skillGaps: report.skillGaps as never,
                    suggestions: report.suggestions as never,
                },
            });

            await cacheService.set(cacheKey(resumeId, jdId), report, CACHE_TTL.ATS_SCORE);

            await db.analyticsEvent.create({
                data: {
                    userId,
                    event: "jd_matched",
                    metadata: {
                        resumeId,
                        jdId,
                        overallScore: report.overallScore,
                    },
                },
            });

            return { success: true, data: report };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            log.error({ resumeId, jdId, userId, error: message }, "Failed to match resume to JD");
            return { success: false, error: `Failed to match resume to JD: ${message}`, code: "MATCH_FAILED" };
        }
    },

    async saveJobDescription(
        userId: string,
        data: { title: string; company?: string; rawText: string }
    ): Promise<ServiceResult<JobDescription>> {
        try {
            const parsed = parseJobDescription(data.rawText);
            const created = await db.jobDescription.create({
                data: {
                    userId,
                    title: data.title,
                    company: data.company ?? "Unknown Company",
                    rawText: data.rawText,
                    parsedData: parsed as never,
                },
            });

            return { success: true, data: created };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            log.error({ userId, error: message }, "Failed to save job description");
            return { success: false, error: `Failed to save job description: ${message}`, code: "CREATE_FAILED" };
        }
    },

    async getUserJobDescriptions(
        userId: string,
        page: number,
        pageSize: number
    ): Promise<ServiceResult<PaginatedResult<JobDescription>>> {
        try {
            const [items, total] = await Promise.all([
                db.jobDescription.findMany({
                    where: { userId },
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    orderBy: { createdAt: "desc" },
                }),
                db.jobDescription.count({ where: { userId } }),
            ]);

            const totalPages = Math.ceil(total / pageSize);

            return {
                success: true,
                data: {
                    items,
                    total,
                    page,
                    pageSize,
                    totalPages,
                    hasMore: page < totalPages,
                },
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            log.error({ userId, error: message }, "Failed to list job descriptions");
            return { success: false, error: `Failed to list job descriptions: ${message}`, code: "LIST_FAILED" };
        }
    },

    async getJobDescription(id: string, userId: string): Promise<ServiceResult<JobDescription>> {
        try {
            const jd = await db.jobDescription.findUnique({ where: { id } });
            if (!jd || jd.userId !== userId) {
                return { success: false, error: "Job description not found", code: "NOT_FOUND" };
            }

            return { success: true, data: jd };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: `Failed to get job description: ${message}`, code: "GET_FAILED" };
        }
    },

    async deleteJobDescription(id: string, userId: string): Promise<ServiceResult<void>> {
        try {
            const jd = await db.jobDescription.findUnique({ where: { id } });
            if (!jd || jd.userId !== userId) {
                return { success: false, error: "Job description not found", code: "NOT_FOUND" };
            }

            await db.jobDescription.delete({ where: { id } });

            return { success: true, data: undefined };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: `Failed to delete job description: ${message}`, code: "DELETE_FAILED" };
        }
    },

    async getMatch(resumeId: string, jdId: string, userId: string): Promise<ServiceResult<PrismaMatchResult>> {
        try {
            const resume = await db.resume.findUnique({ where: { id: resumeId } });
            const jd = await db.jobDescription.findUnique({ where: { id: jdId } });

            if (!resume || !jd || (resume as Record<string, unknown>).userId !== userId || jd.userId !== userId) {
                return { success: false, error: "Match not found", code: "NOT_FOUND" };
            }

            const match = await db.matchResult.findUnique({
                where: {
                    resumeId_jobDescriptionId: {
                        resumeId,
                        jobDescriptionId: jdId,
                    },
                },
            });

            if (!match) {
                return { success: false, error: "Match not found", code: "NOT_FOUND" };
            }

            return { success: true, data: match };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: `Failed to get match: ${message}`, code: "GET_FAILED" };
        }
    },
};
