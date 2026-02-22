import { describe, it, expect } from "vitest";
import { parseJobDescription } from "@/modules/matcher/jd-parser";

describe("jd-parser", () => {
    it("parses standard JD with sections", () => {
        const input = `
Senior Software Engineer at TechCorp
Requirements
- 5+ years of experience
- Python
Preferred Qualifications
- Kubernetes
Responsibilities
- Build APIs
- Mentor engineers
`;

        const parsed = parseJobDescription(input);
        expect(parsed.title.toLowerCase()).toContain("engineer");
        expect(parsed.company).toContain("TechCorp");
        expect(parsed.requirements.length).toBeGreaterThan(0);
        expect(parsed.preferred).toContain("Kubernetes");
        expect(parsed.responsibilities.length).toBe(2);
        expect(parsed.keywords.yearsExperience).toBe(5);
    });

    it("detects what you'll need / what you'll do headers", () => {
        const input = `
Staff Developer
What you'll need
- TypeScript
What you'll do
- Build frontend systems
`;
        const parsed = parseJobDescription(input);
        expect(parsed.requirements[0]).toContain("TypeScript");
        expect(parsed.responsibilities[0]).toContain("Build frontend systems");
    });

    it("falls back to requirements when no clear sections", () => {
        const input = "Backend Engineer\nNeed Python and AWS\nBuild resilient services";
        const parsed = parseJobDescription(input);
        expect(parsed.requirements.length).toBeGreaterThan(0);
    });

    it("extracts bachelor's education", () => {
        const input = "Software Engineer\nBachelor's degree in CS preferred";
        const parsed = parseJobDescription(input);
        expect(parsed.keywords.educationLevel).toContain("bachelor");
    });

    it("handles very short JD", () => {
        const parsed = parseJobDescription("Engineer");
        expect(parsed.title).toBeTruthy();
        expect(parsed.requirements).toEqual([]);
    });
});
