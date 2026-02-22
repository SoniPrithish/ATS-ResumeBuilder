import { describe, it, expect } from "vitest";
import { analyzeOverlap } from "@/modules/matcher/overlap-analyzer";
import { createMockExtractedKeywords, createMockResume } from "../../helpers/factories";

describe("overlap-analyzer", () => {
    it("returns 100% for full overlap", () => {
        const resume = createMockResume();
        const jd = createMockExtractedKeywords({
            hardSkills: ["typescript", "react", "node", "postgresql"],
            tools: ["docker"],
            softSkills: ["communication"],
        });
        const resumeKeywords = createMockExtractedKeywords({
            hardSkills: ["typescript", "react", "node", "postgresql"],
            tools: ["docker"],
            softSkills: ["communication"],
        });

        const result = analyzeOverlap(resumeKeywords, jd, resume);
        expect(result.matchPercentage).toBe(100);
    });

    it("returns 0% for no overlap", () => {
        const resume = createMockResume({
            skills: { technical: ["elixir"], soft: [], tools: [] },
        });
        const jd = createMockExtractedKeywords({ hardSkills: ["python"], tools: ["docker"], softSkills: [] });
        const resumeKeywords = createMockExtractedKeywords({ hardSkills: ["elixir"], tools: [], softSkills: [] });

        const result = analyzeOverlap(resumeKeywords, jd, resume);
        expect(result.matchPercentage).toBe(0);
        expect(result.missing.length).toBeGreaterThan(0);
    });

    it("captures multiple found locations", () => {
        const resume = createMockResume({
            summary: "Experienced with React",
            experience: [
                {
                    ...createMockResume().experience[0],
                    bullets: ["Built React apps"],
                },
            ],
        });
        const jd = createMockExtractedKeywords({ hardSkills: ["react"], tools: [], softSkills: [] });
        const resumeKeywords = createMockExtractedKeywords({ hardSkills: ["react"], tools: [], softSkills: [] });

        const result = analyzeOverlap(resumeKeywords, jd, resume);
        expect(result.matched[0]?.foundIn.length).toBeGreaterThanOrEqual(1);
    });

    it("identifies extra resume skills", () => {
        const resume = createMockResume();
        const jd = createMockExtractedKeywords({ hardSkills: ["python"], tools: [], softSkills: [] });
        const resumeKeywords = createMockExtractedKeywords({ hardSkills: ["python", "react"], tools: [], softSkills: [] });

        const result = analyzeOverlap(resumeKeywords, jd, resume);
        expect(result.extra).toContain("react");
    });

    it("fuzzy matching catches near misses", () => {
        const resume = createMockResume({ skills: { technical: ["pytohn"], soft: [], tools: [] } });
        const jd = createMockExtractedKeywords({ hardSkills: ["python"], tools: [], softSkills: [] });
        const resumeKeywords = createMockExtractedKeywords({ hardSkills: ["pytohn"], tools: [], softSkills: [] });

        const result = analyzeOverlap(resumeKeywords, jd, resume);
        expect(result.matchPercentage).toBe(100);
    });
});
