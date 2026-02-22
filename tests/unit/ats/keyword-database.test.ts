/**
 * @module tests/unit/ats/keyword-database.test
 * @description Validates the tech keyword database, action verbs, and weak verbs.
 */

import { describe, it, expect } from "vitest";
import {
    TECH_KEYWORD_DATABASE,
    ACTION_VERBS,
    WEAK_VERBS,
} from "@/modules/ats/keyword-database";

describe("TECH_KEYWORD_DATABASE", () => {
    it("should contain at least 500 entries", () => {
        expect(TECH_KEYWORD_DATABASE.size).toBeGreaterThanOrEqual(500);
    });

    it("should have all keys in lowercase", () => {
        for (const [key] of TECH_KEYWORD_DATABASE) {
            expect(key).toBe(key.toLowerCase());
        }
    });

    it("should contain Programming Languages category", () => {
        const langs = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Programming Languages"
        );
        expect(langs.length).toBeGreaterThanOrEqual(30);
        expect(TECH_KEYWORD_DATABASE.get("python")).toBe("Programming Languages");
        expect(TECH_KEYWORD_DATABASE.get("javascript")).toBe("Programming Languages");
        expect(TECH_KEYWORD_DATABASE.get("typescript")).toBe("Programming Languages");
        expect(TECH_KEYWORD_DATABASE.get("rust")).toBe("Programming Languages");
    });

    it("should contain Frameworks category", () => {
        const frameworks = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Frameworks"
        );
        expect(frameworks.length).toBeGreaterThanOrEqual(40);
        expect(TECH_KEYWORD_DATABASE.get("react")).toBe("Frameworks");
        expect(TECH_KEYWORD_DATABASE.get("django")).toBe("Frameworks");
        expect(TECH_KEYWORD_DATABASE.get("spring boot")).toBe("Frameworks");
    });

    it("should contain Databases category", () => {
        const dbs = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Databases"
        );
        expect(dbs.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("postgresql")).toBe("Databases");
        expect(TECH_KEYWORD_DATABASE.get("mongodb")).toBe("Databases");
    });

    it("should contain Cloud category", () => {
        const cloud = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Cloud"
        );
        expect(cloud.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("aws")).toBe("Cloud");
        expect(TECH_KEYWORD_DATABASE.get("gcp")).toBe("Cloud");
    });

    it("should contain DevOps category", () => {
        const devops = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "DevOps"
        );
        expect(devops.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("docker")).toBe("DevOps");
        expect(TECH_KEYWORD_DATABASE.get("kubernetes")).toBe("DevOps");
    });

    it("should contain AI/ML category", () => {
        const aiml = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "AI/ML"
        );
        expect(aiml.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("tensorflow")).toBe("AI/ML");
        expect(TECH_KEYWORD_DATABASE.get("pytorch")).toBe("AI/ML");
    });

    it("should contain Tools category", () => {
        const tools = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Tools"
        );
        expect(tools.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("git")).toBe("Tools");
        expect(TECH_KEYWORD_DATABASE.get("jira")).toBe("Tools");
    });

    it("should contain Concepts category", () => {
        const concepts = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Concepts"
        );
        expect(concepts.length).toBeGreaterThanOrEqual(30);
        expect(TECH_KEYWORD_DATABASE.get("microservices")).toBe("Concepts");
        expect(TECH_KEYWORD_DATABASE.get("rest api")).toBe("Concepts");
    });

    it("should contain Soft Skills category", () => {
        const soft = Array.from(TECH_KEYWORD_DATABASE.entries()).filter(
            ([, cat]) => cat === "Soft Skills"
        );
        expect(soft.length).toBeGreaterThanOrEqual(20);
        expect(TECH_KEYWORD_DATABASE.get("leadership")).toBe("Soft Skills");
        expect(TECH_KEYWORD_DATABASE.get("communication")).toBe("Soft Skills");
    });
});

describe("ACTION_VERBS", () => {
    it("should contain at least 150 entries", () => {
        expect(ACTION_VERBS.length).toBeGreaterThanOrEqual(150);
    });

    it("should contain leadership verbs", () => {
        const lowerVerbs = ACTION_VERBS.map((v) => v.toLowerCase());
        expect(lowerVerbs).toContain("led");
        expect(lowerVerbs).toContain("managed");
        expect(lowerVerbs).toContain("directed");
    });

    it("should contain technical verbs", () => {
        const lowerVerbs = ACTION_VERBS.map((v) => v.toLowerCase());
        expect(lowerVerbs).toContain("developed");
        expect(lowerVerbs).toContain("implemented");
        expect(lowerVerbs).toContain("designed");
        expect(lowerVerbs).toContain("architected");
    });

    it("should contain achievement verbs", () => {
        const lowerVerbs = ACTION_VERBS.map((v) => v.toLowerCase());
        expect(lowerVerbs).toContain("achieved");
        expect(lowerVerbs).toContain("improved");
        expect(lowerVerbs).toContain("reduced");
        expect(lowerVerbs).toContain("optimized");
    });

    it("should have all verbs in lowercase", () => {
        for (const verb of ACTION_VERBS) {
            expect(verb).toBe(verb.toLowerCase());
        }
    });
});

describe("WEAK_VERBS", () => {
    it("should contain common weak phrases", () => {
        const lowerVerbs = WEAK_VERBS.map((v) => v.toLowerCase());
        expect(lowerVerbs).toContain("helped");
        expect(lowerVerbs).toContain("assisted");
        expect(lowerVerbs).toContain("worked on");
        expect(lowerVerbs).toContain("responsible for");
        expect(lowerVerbs).toContain("participated in");
        expect(lowerVerbs).toContain("utilized");
    });

    it("should have at least 15 entries", () => {
        expect(WEAK_VERBS.length).toBeGreaterThanOrEqual(15);
    });

    it("should not overlap with action verbs", () => {
        const actionSet = new Set(ACTION_VERBS.map((v) => v.toLowerCase()));
        for (const weak of WEAK_VERBS) {
            // Single-word weak verbs should not appear in action verbs
            if (!weak.includes(" ")) {
                expect(actionSet.has(weak.toLowerCase())).toBe(false);
            }
        }
    });
});
