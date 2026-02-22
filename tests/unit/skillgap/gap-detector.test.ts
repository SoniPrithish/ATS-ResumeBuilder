import { describe, it, expect } from "vitest";
import { detectGaps } from "@/modules/skillgap/gap-detector";
import { createMockExtractedKeywords, createMockSkillSet } from "../../helpers/factories";

describe("gap-detector", () => {
    it("returns empty gaps when all skills present", () => {
        const resumeSkills = createMockSkillSet({ technical: ["python", "react"], tools: ["docker"], soft: ["communication"] });
        const jd = createMockExtractedKeywords({ hardSkills: ["python", "react"], tools: ["docker"], softSkills: ["communication"], certifications: [] });
        const gaps = detectGaps(resumeSkills, jd);
        expect(gaps).toEqual([]);
    });

    it("flags critical missing hard skills", () => {
        const resumeSkills = createMockSkillSet({ technical: ["python"], tools: [], soft: [] });
        const jd = createMockExtractedKeywords({ hardSkills: ["python", "react"], tools: [], softSkills: [], certifications: [] });
        const gaps = detectGaps(resumeSkills, jd);
        expect(gaps.some((gap) => gap.skill === "react" && gap.category === "critical")).toBe(true);
    });

    it("populates related skills in resume", () => {
        const resumeSkills = createMockSkillSet({ technical: ["vue"], tools: [], soft: [] });
        const jd = createMockExtractedKeywords({ hardSkills: ["react"], tools: [], softSkills: [], certifications: [] });
        const gaps = detectGaps(resumeSkills, jd);
        expect(gaps[0]?.relatedSkillsInResume).toContain("vue");
    });

    it("categorizes mixed gaps", () => {
        const resumeSkills = createMockSkillSet({ technical: [], tools: [], soft: [] });
        const jd = createMockExtractedKeywords({ hardSkills: ["python"], softSkills: ["communication"], tools: [], certifications: ["aws certified"] });
        const gaps = detectGaps(resumeSkills, jd);
        expect(gaps.find((gap) => gap.skill === "python")?.category).toBe("critical");
        expect(gaps.find((gap) => gap.skill === "communication")?.category).toBe("recommended");
    });

    it("fuzzy matching avoids false gaps", () => {
        const resumeSkills = createMockSkillSet({ technical: ["react.js"], tools: [], soft: [] });
        const jd = createMockExtractedKeywords({ hardSkills: ["react"], tools: [], softSkills: [], certifications: [] });
        const gaps = detectGaps(resumeSkills, jd);
        expect(gaps.length).toBe(0);
    });
});
