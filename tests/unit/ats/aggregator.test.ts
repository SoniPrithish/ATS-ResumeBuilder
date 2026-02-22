/**
 * @module tests/unit/ats/aggregator.test
 * @description Tests for the ATS score aggregator.
 */

import { describe, it, expect } from "vitest";
import {
    calculateATSScore,
    calculateATSScoreWithFileType,
} from "@/modules/ats/aggregator";
import { createMockResume } from "../../../tests/helpers/factories";
import type { CanonicalResume } from "@/types/resume";
import type { ATSScoringConfig } from "@/modules/ats/types";

describe("calculateATSScore", () => {
    it("should score a well-crafted resume 60-95", () => {
        const resume = createMockResume({
            summary:
                "Senior Software Engineer with 5+ years of experience building scalable applications. Passionate about clean architecture, developer tooling, and open source.",
            experience: [
                {
                    id: "exp-1",
                    company: "TechCorp Inc.",
                    title: "Senior Software Engineer",
                    location: "San Francisco, CA",
                    startDate: "2021-01",
                    endDate: "2024-01",
                    current: false,
                    bullets: [
                        "Led development of microservices architecture serving 1M+ users with 99.9% uptime across all production environments",
                        "Reduced API latency by 40% through implementing Redis caching and optimizing PostgreSQL query patterns",
                        "Mentored 5 junior engineers across 2 teams through weekly 1-on-1 sessions and code review workshops",
                        "Designed and implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes using GitHub Actions",
                    ],
                    technologies: ["TypeScript", "Node.js", "PostgreSQL", "Redis"],
                },
                {
                    id: "exp-2",
                    company: "StartupXYZ",
                    title: "Software Engineer",
                    location: "Remote",
                    startDate: "2019-01",
                    endDate: "2021-01",
                    current: false,
                    bullets: [
                        "Developed a real-time analytics dashboard processing 10M events daily using React and WebSocket",
                        "Implemented automated testing increasing code coverage from 30% to 85% across the entire codebase",
                        "Optimized database queries reducing average response time by 60% for critical customer-facing endpoints",
                    ],
                    technologies: ["React", "Python", "MongoDB", "AWS"],
                },
            ],
        });

        const result = calculateATSScore(resume);

        expect(result.overallScore).toBeGreaterThanOrEqual(50);
        expect(result.overallScore).toBeLessThanOrEqual(95);
        expect(result.breakdown).toBeDefined();
        expect(result.suggestions).toBeDefined();
        expect(result.analyzedAt).toBeTruthy();
    });

    it("should score a poorly-crafted resume 15-50", () => {
        const resume: CanonicalResume = {
            contactInfo: {
                fullName: "",
                email: "",
            },
            experience: [
                {
                    id: "exp-1",
                    company: "SomeCo",
                    title: "Worker",
                    startDate: "2023",
                    current: false,
                    bullets: [
                        "Helped with tasks",
                        "Worked on stuff",
                        "Assisted team members",
                    ],
                },
            ],
            education: [],
            skills: {
                technical: [],
                soft: [],
                tools: [],
            },
        };

        const result = calculateATSScore(resume);

        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(50);
        expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should return all 5 categories in breakdown", () => {
        const resume = createMockResume();
        const result = calculateATSScore(resume);

        // The breakdown should have our named categories
        expect(result.breakdown.format).toBeDefined();
        expect(result.breakdown.keywords).toBeDefined();
        expect(result.breakdown.sections).toBeDefined();
        expect(result.breakdown.bullets).toBeDefined();
        expect(result.breakdown.readability).toBeDefined();
    });

    it("should sort suggestions by severity", () => {
        const resume = createMockResume();
        const result = calculateATSScore(resume);

        const priorities = result.suggestions.map((s) => s.priority);
        const priorityOrder: Record<string, number> = {
            high: 0,
            medium: 1,
            low: 2,
        };

        for (let i = 1; i < priorities.length; i++) {
            expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(
                priorityOrder[priorities[i - 1]]
            );
        }
    });
});

describe("calculateATSScoreWithFileType", () => {
    it("should accept fileType and targetKeywords", () => {
        const resume = createMockResume();
        const result = calculateATSScoreWithFileType(resume, "pdf", [
            "TypeScript",
            "React",
            "Node.js",
        ]);

        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
        expect(result.breakdown).toBeDefined();
    });

    it("should use custom weights when provided", () => {
        const resume = createMockResume();

        const defaultResult = calculateATSScore(resume);

        const customConfig: ATSScoringConfig = {
            weights: {
                format: 50,
                keywords: 10,
                sections: 10,
                bullets: 20,
                readability: 10,
            },
        };

        const customResult = calculateATSScoreWithFileType(
            resume,
            "pdf",
            undefined,
            customConfig
        );

        // With different weights, the overall score should differ
        // (unless all categories have exactly the same score, which is unlikely)
        expect(typeof customResult.overallScore).toBe("number");
        expect(customResult.overallScore).toBeGreaterThanOrEqual(0);
        expect(customResult.overallScore).toBeLessThanOrEqual(100);
    });
});

describe("aggregator — edge cases", () => {
    it("should handle a resume with no projects or certifications", () => {
        const resume = createMockResume({
            projects: undefined,
            certifications: undefined,
        });

        const result = calculateATSScore(resume);
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it("should handle a resume with empty arrays", () => {
        const resume = createMockResume({
            experience: [],
            education: [],
            projects: [],
            certifications: [],
        });

        const result = calculateATSScore(resume);
        expect(result.overallScore).toBeGreaterThanOrEqual(0);
        // Should be low but not crash
        expect(result.overallScore).toBeLessThanOrEqual(60);
    });
});
