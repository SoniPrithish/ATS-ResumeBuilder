/**
 * @module tests/unit/ats/section-scorer.test
 * @description Tests for the ATS section completeness scorer.
 */

import { describe, it, expect } from "vitest";
import { scoreSections } from "@/modules/ats/section-scorer";
import type { SectionInput } from "@/modules/ats/types";

describe("scoreSections", () => {
    it("should score a complete resume ~95-100", () => {
        const input: SectionInput = {
            hasContact: true,
            hasSummary: true,
            experienceCount: 3,
            experienceBulletCount: 12,
            educationCount: 2,
            skillCount: 20,
            hasProjects: true,
            hasCertifications: true,
        };

        const result = scoreSections(input);
        expect(result.score).toBeGreaterThanOrEqual(95);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.category).toBe("sections");
    });

    it("should lose 30 points with no experience", () => {
        const input: SectionInput = {
            hasContact: true,
            hasSummary: true,
            experienceCount: 0,
            experienceBulletCount: 0,
            educationCount: 2,
            skillCount: 20,
            hasProjects: true,
            hasCertifications: true,
        };

        const result = scoreSections(input);
        // Max = 15 + 10 + 0 + 20 + 15 + 5 + 5 = 70
        expect(result.score).toBeLessThanOrEqual(70);
        expect(result.suggestions.some((s) => s.toLowerCase().includes("experience"))).toBe(
            true
        );
    });

    it("should lose 20 points with no education", () => {
        const input: SectionInput = {
            hasContact: true,
            hasSummary: true,
            experienceCount: 3,
            experienceBulletCount: 12,
            educationCount: 0,
            skillCount: 20,
            hasProjects: true,
            hasCertifications: true,
        };

        const result = scoreSections(input);
        // Max = 15 + 10 + 30 + 0 + 15 + 5 + 5 = 80
        expect(result.score).toBeLessThanOrEqual(80);
        expect(result.suggestions.some((s) => s.toLowerCase().includes("education"))).toBe(
            true
        );
    });

    it("should score ~50 for minimal resume", () => {
        // Just contact + 1 experience entry
        const input: SectionInput = {
            hasContact: true,
            hasSummary: false,
            experienceCount: 1,
            experienceBulletCount: 2,
            educationCount: 0,
            skillCount: 0,
            hasProjects: false,
            hasCertifications: false,
        };

        const result = scoreSections(input);
        // 15 + 0 + 15 + 0 + 0 = 30
        // Note: with contact=15, experience entry=15, no average 3+ bullets
        expect(result.score).toBeLessThanOrEqual(50);
        expect(result.score).toBeGreaterThanOrEqual(20);
    });

    it("should score ~0 for empty resume", () => {
        const input: SectionInput = {
            hasContact: false,
            hasSummary: false,
            experienceCount: 0,
            experienceBulletCount: 0,
            educationCount: 0,
            skillCount: 0,
            hasProjects: false,
            hasCertifications: false,
        };

        const result = scoreSections(input);
        expect(result.score).toBe(0);
    });

    it("should give bonus for projects section", () => {
        const withProjects: SectionInput = {
            hasContact: true,
            hasSummary: true,
            experienceCount: 2,
            experienceBulletCount: 8,
            educationCount: 1,
            skillCount: 10,
            hasProjects: true,
            hasCertifications: false,
        };

        const withoutProjects: SectionInput = {
            ...withProjects,
            hasProjects: false,
        };

        const scoreWith = scoreSections(withProjects);
        const scoreWithout = scoreSections(withoutProjects);

        expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });

    it("should scale skills score by count", () => {
        const fewSkills: SectionInput = {
            hasContact: true,
            hasSummary: true,
            experienceCount: 1,
            experienceBulletCount: 3,
            educationCount: 1,
            skillCount: 3,
            hasProjects: false,
            hasCertifications: false,
        };

        const manySkills: SectionInput = {
            ...fewSkills,
            skillCount: 20,
        };

        const scoreFew = scoreSections(fewSkills);
        const scoreMany = scoreSections(manySkills);

        expect(scoreMany.score).toBeGreaterThan(scoreFew.score);
    });
});
