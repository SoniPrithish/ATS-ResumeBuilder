/**
 * @module tests/unit/ats/keyword-scorer.test
 * @description Tests for the ATS keyword density scorer.
 */

import { describe, it, expect } from "vitest";
import { scoreKeywords } from "@/modules/ats/keyword-scorer";
import type { KeywordInput } from "@/modules/ats/types";
import type { SkillSet } from "@/types/resume";

const richSkills: SkillSet = {
    technical: [
        "TypeScript",
        "Python",
        "React",
        "Node.js",
        "PostgreSQL",
        "Docker",
        "Kubernetes",
        "AWS",
        "Redis",
        "GraphQL",
    ],
    soft: ["Leadership", "Communication", "Problem Solving"],
    tools: ["Git", "Jira", "VS Code", "Figma", "Postman"],
    languages: ["English"],
    certifications: ["AWS Solutions Architect"],
};

const sparseSkills: SkillSet = {
    technical: ["Python"],
    soft: [],
    tools: [],
};

describe("scoreKeywords — with JD keywords", () => {
    it("should score high match (~90+) when most keywords match", () => {
        const input: KeywordInput = {
            resumeSkills: richSkills,
            rawText:
                "Experienced TypeScript developer with Python, React, Node.js, PostgreSQL, Docker, Kubernetes, AWS, Redis, and GraphQL expertise.",
            targetKeywords: [
                "TypeScript",
                "React",
                "Node.js",
                "PostgreSQL",
                "Docker",
                "AWS",
            ],
        };

        const result = scoreKeywords(input);
        expect(result.score).toBeGreaterThanOrEqual(90);
        expect(result.category).toBe("keywords");
    });

    it("should score low (~30-50) with poor match", () => {
        const input: KeywordInput = {
            resumeSkills: sparseSkills,
            rawText: "I have experience with basic Python scripting.",
            targetKeywords: [
                "TypeScript",
                "React",
                "Node.js",
                "PostgreSQL",
                "Docker",
                "Kubernetes",
                "AWS",
                "GraphQL",
                "Redis",
                "MongoDB",
            ],
        };

        const result = scoreKeywords(input);
        expect(result.score).toBeLessThanOrEqual(50);
    });

    it("should apply keyword stuffing penalty", () => {
        const input: KeywordInput = {
            resumeSkills: richSkills,
            rawText:
                "TypeScript TypeScript TypeScript TypeScript TypeScript TypeScript TypeScript expert developer",
            targetKeywords: ["TypeScript", "React"],
        };

        const result = scoreKeywords(input);
        // Should have stuffing penalty applied
        expect(result.suggestions.some((s) => s.includes("stuffing"))).toBe(true);
    });

    it("should be case-insensitive", () => {
        const input: KeywordInput = {
            resumeSkills: {
                technical: ["typescript", "REACT"],
                soft: [],
                tools: [],
            },
            rawText: "I work with TYPESCRIPT and react daily.",
            targetKeywords: ["TypeScript", "React"],
        };

        const result = scoreKeywords(input);
        expect(result.score).toBeGreaterThanOrEqual(90);
    });

    it("should list matched and missing keywords in details", () => {
        const input: KeywordInput = {
            resumeSkills: richSkills,
            rawText: "TypeScript React Node.js developer",
            targetKeywords: ["TypeScript", "React", "Svelte", "Rust"],
        };

        const result = scoreKeywords(input);
        expect(result.feedback).toContain("Matched");
    });
});

describe("scoreKeywords — without JD keywords (general)", () => {
    it("should score well for keyword-rich resume", () => {
        const input: KeywordInput = {
            resumeSkills: richSkills,
            rawText:
                "Experienced in TypeScript, Python, React, Node.js, PostgreSQL, Docker, Kubernetes, AWS, Redis, GraphQL, microservices, CI/CD, agile, TDD, REST API, system design, machine learning, TensorFlow, pandas, git, jira, figma, webpack, leadership, communication, problem-solving, spring boot, angular, vue, mongodb, elasticsearch, terraform, jenkins, github actions, prometheus, grafana, django, flask, express, jest, cypress",
        };

        const result = scoreKeywords(input);
        expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it("should score low for sparse resume", () => {
        const input: KeywordInput = {
            resumeSkills: sparseSkills,
            rawText: "I am a dedicated worker with some experience.",
        };

        const result = scoreKeywords(input);
        expect(result.score).toBeLessThanOrEqual(50);
    });

    it("should give diversity bonus for multiple categories", () => {
        const input: KeywordInput = {
            resumeSkills: richSkills,
            rawText:
                "Python developer using React with PostgreSQL on AWS with Docker, CI/CD, and leadership",
        };

        const result = scoreKeywords(input);
        // Should have diversity bonus since multiple categories are represented
        expect(result.score).toBeGreaterThanOrEqual(60);
    });
});
