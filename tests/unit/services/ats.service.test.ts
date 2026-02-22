/**
 * @module tests/unit/services/ats.service.test
 * @description Tests for the ATS service with caching layer.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    mockPrisma,
    mockCacheHelpers,
    resetAllMocks,
} from "../../../tests/helpers/mocks";
import { createMockResume, createMockUser } from "../../../tests/helpers/factories";

// Must import after mocks are set up
import { atsService } from "@/server/services/ats.service";

const userId = "user-test-123";
const resumeId = "resume-test-123";

/** Build a fake Prisma resume record */
function buildResumeRecord(overrides: Record<string, unknown> = {}) {
    const resume = createMockResume();
    return {
        id: resumeId,
        userId,
        title: "Test Resume",
        status: "DRAFT",
        contactInfo: resume.contactInfo,
        summary: resume.summary,
        experience: resume.experience,
        education: resume.education,
        skills: resume.skills,
        projects: resume.projects,
        certifications: resume.certifications,
        rawText: null,
        originalFileUrl: null,
        originalFileName: "test.pdf",
        originalFileType: "pdf",
        lastAtsScore: null,
        lastAtsDetails: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}

describe("atsService.scoreResume", () => {
    beforeEach(() => {
        resetAllMocks();
    });

    it("should calculate, store, and cache on cache miss", async () => {
        const record = buildResumeRecord();
        mockPrisma.resume.findUnique.mockResolvedValue(record);
        mockPrisma.resume.update.mockResolvedValue(record);
        mockCacheHelpers.getCache.mockResolvedValue(null);
        mockCacheHelpers.setCache.mockResolvedValue(undefined);

        const result = await atsService.scoreResume(resumeId, userId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.data.overallScore).toBeLessThanOrEqual(100);
            expect(result.data.breakdown).toBeDefined();
            expect(result.data.suggestions).toBeDefined();
        }

        // Should have updated DB
        expect(mockPrisma.resume.update).toHaveBeenCalled();
        // Should have cached
        expect(mockCacheHelpers.setCache).toHaveBeenCalled();
    });

    it("should return cached score on cache hit", async () => {
        const cachedScore = {
            overallScore: 85,
            breakdown: {},
            suggestions: [],
            analyzedAt: new Date().toISOString(),
        };

        const record = buildResumeRecord();
        mockPrisma.resume.findUnique.mockResolvedValue(record);
        mockCacheHelpers.getCache.mockResolvedValue(cachedScore);

        const result = await atsService.scoreResume(resumeId, userId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.overallScore).toBe(85);
        }

        // Should NOT have updated DB or recalculated
        expect(mockPrisma.resume.update).not.toHaveBeenCalled();
    });

    it("should return error when resume not found", async () => {
        mockPrisma.resume.findUnique.mockResolvedValue(null);

        const result = await atsService.scoreResume(resumeId, userId);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("not found");
        }
    });

    it("should return error when user doesn't own resume", async () => {
        const record = buildResumeRecord({ userId: "other-user" });
        mockPrisma.resume.findUnique.mockResolvedValue(record);

        const result = await atsService.scoreResume(resumeId, userId);

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toContain("not found");
        }
    });

    it("should skip cache when target keywords are provided", async () => {
        const record = buildResumeRecord();
        mockPrisma.resume.findUnique.mockResolvedValue(record);
        mockPrisma.resume.update.mockResolvedValue(record);
        mockCacheHelpers.getCache.mockResolvedValue(null);
        mockCacheHelpers.setCache.mockResolvedValue(undefined);

        const result = await atsService.scoreResume(resumeId, userId, [
            "TypeScript",
            "React",
        ]);

        expect(result.success).toBe(true);
        // getCache should NOT have been called when keywords are provided
        expect(mockCacheHelpers.getCache).not.toHaveBeenCalled();
    });
});

describe("atsService.getScore", () => {
    beforeEach(() => {
        resetAllMocks();
    });

    it("should return cached score when available", async () => {
        const cachedScore = {
            overallScore: 78,
            breakdown: {},
            suggestions: [],
            analyzedAt: new Date().toISOString(),
        };
        mockCacheHelpers.getCache.mockResolvedValue(cachedScore);

        const result = await atsService.getScore(resumeId, userId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data?.overallScore).toBe(78);
        }
    });

    it("should fetch from DB when not cached", async () => {
        mockCacheHelpers.getCache.mockResolvedValue(null);

        const storedScore = {
            overallScore: 72,
            breakdown: {},
            suggestions: [],
            analyzedAt: new Date().toISOString(),
        };
        const record = buildResumeRecord({ lastAtsDetails: storedScore });
        mockPrisma.resume.findUnique.mockResolvedValue(record);

        const result = await atsService.getScore(resumeId, userId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data?.overallScore).toBe(72);
        }
    });

    it("should return null when no score exists", async () => {
        mockCacheHelpers.getCache.mockResolvedValue(null);
        const record = buildResumeRecord({ lastAtsDetails: null });
        mockPrisma.resume.findUnique.mockResolvedValue(record);

        const result = await atsService.getScore(resumeId, userId);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBeNull();
        }
    });
});

describe("atsService.compareScores", () => {
    beforeEach(() => {
        resetAllMocks();
    });

    it("should compare multiple resumes", async () => {
        const score1 = {
            overallScore: 85,
            breakdown: {},
            suggestions: [],
            analyzedAt: new Date().toISOString(),
        };
        const score2 = {
            overallScore: 72,
            breakdown: {},
            suggestions: [],
            analyzedAt: new Date().toISOString(),
        };

        // First call to getScore (cache check)
        mockCacheHelpers.getCache
            .mockResolvedValueOnce(score1)
            .mockResolvedValueOnce(score2);

        const result = await atsService.compareScores(
            ["resume-1", "resume-2"],
            userId
        );

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(2);
            expect(result.data[0].overallScore).toBe(85);
            expect(result.data[1].overallScore).toBe(72);
        }
    });
});
