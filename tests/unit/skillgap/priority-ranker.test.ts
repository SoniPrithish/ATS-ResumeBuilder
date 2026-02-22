import { describe, it, expect } from "vitest";
import { rankGaps } from "@/modules/skillgap/priority-ranker";
import type { SkillGap } from "@/types/job";

const gaps: SkillGap[] = [
    { skill: "react", category: "critical", source: "required", relatedSkillsInResume: [] },
    { skill: "docker", category: "recommended", source: "preferred", relatedSkillsInResume: ["kubernetes"] },
    { skill: "excel", category: "bonus", source: "preferred", relatedSkillsInResume: [] },
];

describe("priority-ranker", () => {
    it("ranks critical above bonus", () => {
        const ranked = rankGaps(gaps);
        expect(ranked[0]?.category).toBe("critical");
    });

    it("boosts high-demand skills", () => {
        const ranked = rankGaps(gaps);
        const react = ranked.find((item) => item.skill === "react");
        expect((react?.priority ?? 0) > 30).toBe(true);
    });

    it("deprioritizes related-skill gaps", () => {
        const ranked = rankGaps(gaps);
        const docker = ranked.find((item) => item.skill === "docker");
        expect((docker?.priority ?? 0) < 35).toBe(true);
    });

    it("sorts by priority descending", () => {
        const ranked = rankGaps(gaps);
        expect(ranked[0]!.priority).toBeGreaterThanOrEqual(ranked[1]!.priority);
    });

    it("sets learning-time estimates", () => {
        const ranked = rankGaps(gaps);
        expect(ranked.every((item) => item.estimatedLearningTime.length > 0)).toBe(true);
    });
});
