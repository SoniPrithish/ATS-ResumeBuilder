import { describe, it, expect } from "vitest";
import { generateMatchReport } from "@/modules/matcher/match-reporter";
import { createMockJobDescription, createMockResume } from "../../helpers/factories";

describe("match-reporter", () => {
    it("scores well-matched resume/JD in expected range", () => {
        const resume = createMockResume();
        const jd = createMockJobDescription({
            rawText: "Senior engineer with React TypeScript Node PostgreSQL AWS Docker",
        });

        const report = generateMatchReport(resume, jd);
        expect(report.overallScore).toBeGreaterThanOrEqual(40);
        expect(report.overallScore).toBeLessThanOrEqual(100);
        expect(report.skillGaps).toBeDefined();
    });

    it("scores poorly matched lower", () => {
        const resume = createMockResume({
            skills: { technical: ["excel"], soft: ["teamwork"], tools: ["word"] },
        });
        const jd = createMockJobDescription({
            rawText: "Need kubernetes terraform aws python react microservices",
        });

        const report = generateMatchReport(resume, jd);
        expect(report.overallScore).toBeLessThan(60);
    });

    it("provides actionable suggestions", () => {
        const report = generateMatchReport(
            createMockResume({ skills: { technical: ["java"], soft: [], tools: [] } }),
            createMockJobDescription({ rawText: "Need react python aws docker" })
        );

        expect(report.suggestions.length).toBeGreaterThan(0);
    });

    it("populates all sub-scores", () => {
        const report = generateMatchReport(createMockResume(), createMockJobDescription());
        expect(report.keywordScore).toBeGreaterThanOrEqual(0);
        expect(report.similarityScore).toBeGreaterThanOrEqual(0);
        expect(report.skillCoverageScore).toBeGreaterThanOrEqual(0);
        expect(report.experienceRelevanceScore).toBeGreaterThanOrEqual(0);
    });

    it("returns ranked skill gaps", () => {
        const report = generateMatchReport(
            createMockResume({ skills: { technical: ["python"], soft: [], tools: [] } }),
            createMockJobDescription({ rawText: "Need kubernetes terraform react aws" })
        );

        expect(report.skillGaps.every((gap) => gap.rank >= 1)).toBe(true);
    });
});
