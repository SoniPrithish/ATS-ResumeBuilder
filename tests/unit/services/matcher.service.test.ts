import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, mockCacheHelpers } from "../../helpers/mocks";
import { createMockResume, createMockJobDescription } from "../../helpers/factories";

vi.mock("@/modules/matcher", () => ({
    parseJobDescription: vi.fn(() => createMockJobDescription()),
    generateMatchReport: vi.fn(() => ({
        overallScore: 80,
        keywordScore: 78,
        similarityScore: 74,
        skillCoverageScore: 82,
        experienceRelevanceScore: 79,
        matchedKeywords: [{ keyword: "python", category: "hardSkill", foundIn: ["skills"] }],
        missingKeywords: [{ keyword: "kubernetes", category: "tool", importance: "required" }],
        suggestions: ["Add kubernetes"],
        skillGaps: [],
    })),
}));

import { matcherService } from "@/server/services/matcher.service";

describe("matcher.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("cache miss generates stores and caches", async () => {
        mockPrisma.resume.findUnique.mockResolvedValue({ id: "r1", userId: "u1", ...createMockResume() });
        mockPrisma.jobDescription.findUnique.mockResolvedValue({
            id: "j1",
            userId: "u1",
            rawText: "Need python",
            parsedData: createMockJobDescription(),
        });
        mockCacheHelpers.getCache.mockResolvedValue(null);
        mockPrisma.matchResult.upsert.mockResolvedValue({});
        mockPrisma.analyticsEvent.create.mockResolvedValue({});

        const result = await matcherService.matchResumeToJD("r1", "j1", "u1");
        expect(result.success).toBe(true);
        expect(mockPrisma.matchResult.upsert).toHaveBeenCalled();
        expect(mockCacheHelpers.setCache).toHaveBeenCalled();
    });

    it("cache hit returns cached", async () => {
        mockPrisma.resume.findUnique.mockResolvedValue({ id: "r1", userId: "u1", ...createMockResume() });
        mockPrisma.jobDescription.findUnique.mockResolvedValue({ id: "j1", userId: "u1", rawText: "Need python" });
        mockCacheHelpers.getCache.mockResolvedValue({ overallScore: 90 });

        const result = await matcherService.matchResumeToJD("r1", "j1", "u1");
        expect(result.success).toBe(true);
        if (result.success) {
            expect((result.data as any).overallScore).toBe(90);
        }
    });

    it("returns error if resume not found", async () => {
        mockPrisma.resume.findUnique.mockResolvedValue(null);
        const result = await matcherService.matchResumeToJD("r1", "j1", "u1");
        expect(result.success).toBe(false);
    });

    it("returns error on wrong user", async () => {
        mockPrisma.resume.findUnique.mockResolvedValue({ id: "r1", userId: "other" });
        const result = await matcherService.matchResumeToJD("r1", "j1", "u1");
        expect(result.success).toBe(false);
    });

    it("saveJobDescription creates and parses", async () => {
        mockPrisma.jobDescription.create.mockResolvedValue({ id: "j1", userId: "u1" });
        const result = await matcherService.saveJobDescription("u1", {
            title: "SE",
            company: "TechCorp",
            rawText: "Need python and react with 5+ years",
        });
        expect(result.success).toBe(true);
        expect(mockPrisma.jobDescription.create).toHaveBeenCalled();
    });

    it("getUserJobDescriptions paginates", async () => {
        mockPrisma.jobDescription.findMany.mockResolvedValue([{ id: "j1" }]);
        mockPrisma.jobDescription.count.mockResolvedValue(1);
        const result = await matcherService.getUserJobDescriptions("u1", 1, 10);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.items).toHaveLength(1);
        }
    });

    it("deleteJobDescription removes", async () => {
        mockPrisma.jobDescription.findUnique.mockResolvedValue({ id: "j1", userId: "u1" });
        mockPrisma.jobDescription.delete.mockResolvedValue({});
        const result = await matcherService.deleteJobDescription("j1", "u1");
        expect(result.success).toBe(true);
    });
});
