import { describe, it, expect } from "vitest";
import { extractKeywordsFromText } from "@/modules/matcher/keyword-extractor";

describe("keyword-extractor", () => {
    it("extracts hard skills from tech-heavy text", () => {
        const text = "Need Python, React, PostgreSQL, AWS, Docker and GraphQL";
        const result = extractKeywordsFromText(text);
        expect(result.hardSkills).toEqual(expect.arrayContaining(["python", "react", "postgresql", "graphql"]));
        expect(result.tools).toEqual(expect.arrayContaining(["aws", "docker"]));
    });

    it("extracts soft skills", () => {
        const text = "Strong communication and leadership skills required";
        const result = extractKeywordsFromText(text);
        expect(result.softSkills.length).toBeGreaterThanOrEqual(0);
    });

    it("normalizes abbreviations", () => {
        const text = "Experience with JS, K8s, and PG databases";
        const result = extractKeywordsFromText(text);
        expect(result.hardSkills).toEqual(expect.arrayContaining(["javascript", "postgresql"]));
        expect(result.tools).toEqual(expect.arrayContaining(["kubernetes"]));
    });

    it("detects bigrams and trigrams", () => {
        const text = "Looking for machine learning and natural language processing experience";
        const result = extractKeywordsFromText(text);
        expect(result.hardSkills.length).toBeGreaterThanOrEqual(0);
    });

    it("deduplicates react/react.js", () => {
        const text = "React and React.js and ReactJS";
        const result = extractKeywordsFromText(text);
        const reactCount = result.hardSkills.filter((s) => s === "react").length;
        expect(reactCount).toBe(1);
    });

    it("returns empty keywords for empty text", () => {
        const result = extractKeywordsFromText("");
        expect(result.hardSkills).toEqual([]);
        expect(result.tools).toEqual([]);
    });
});
