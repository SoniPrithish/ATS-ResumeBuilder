import { describe, it, expect } from "vitest";
import { generateRecommendations } from "@/modules/skillgap/recommendation-engine";
import type { RankedSkillGap } from "@/modules/matcher/types";

function buildGap(index: number, category: RankedSkillGap["category"]): RankedSkillGap {
    return {
        skill: `skill-${index}`,
        category,
        source: category === "critical" ? "required" : "preferred",
        relatedSkillsInResume: [],
        rank: index,
        priority: 100 - index,
        estimatedLearningTime: "2-4 weeks",
        suggestedResources: [],
    };
}

describe("recommendation-engine", () => {
    it("generates recommendations for top gaps", () => {
        const recs = generateRecommendations([buildGap(1, "critical"), buildGap(2, "recommended")]);
        expect(recs.length).toBe(2);
    });

    it("includes 3 resources each", () => {
        const recs = generateRecommendations([buildGap(1, "critical")]);
        expect(recs[0]?.resources).toHaveLength(3);
    });

    it("maps why-it-matters by severity", () => {
        const critical = generateRecommendations([buildGap(1, "critical")])[0];
        const bonus = generateRecommendations([buildGap(1, "bonus")])[0];
        expect(critical?.whyItMatters.toLowerCase()).toContain("required skill");
        expect(bonus?.whyItMatters.toLowerCase()).toContain("nice-to-have");
    });

    it("returns empty for empty input", () => {
        expect(generateRecommendations([])).toEqual([]);
    });

    it("caps recommendations at 10", () => {
        const many = Array.from({ length: 20 }, (_, i) => buildGap(i + 1, "recommended"));
        const recs = generateRecommendations(many);
        expect(recs).toHaveLength(10);
    });
});
