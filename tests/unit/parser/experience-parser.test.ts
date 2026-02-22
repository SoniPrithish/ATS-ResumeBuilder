import { describe, it, expect } from "vitest";
import { parseExperience } from "@/modules/parser/experience-parser";

describe("parseExperience", () => {
  it("should parse standard format with 2 entries", () => {
    const text = [
      "Software Engineer at Google",
      "Jan 2022 - Present",
      "- Built scalable APIs serving 1M+ users",
      "- Reduced latency by 40%",
      "",
      "Junior Developer at StartupCo",
      "Jun 2020 - Dec 2021",
      "- Developed React frontend",
      "- Wrote unit tests",
    ].join("\n");

    const entries = parseExperience(text);

    expect(entries.length).toBe(2);
    expect(entries[0].title).toBe("Software Engineer");
    expect(entries[0].company).toBe("Google");
    expect(entries[0].current).toBe(true);
    expect(entries[0].bullets.length).toBe(2);

    expect(entries[1].title).toBe("Junior Developer");
    expect(entries[1].company).toBe("StartupCo");
    expect(entries[1].current).toBe(false);
    expect(entries[1].bullets.length).toBe(2);
  });

  it("should handle varied date formats", () => {
    const text = [
      "Engineer at Corp",
      "January 2023 - Present",
      "- Did things",
    ].join("\n");

    const entries = parseExperience(text);
    expect(entries.length).toBe(1);
    expect(entries[0].current).toBe(true);
  });

  it("should handle dash-separated company | title format", () => {
    const text = [
      "Google — Software Engineer",
      "Jan 2020 - Dec 2023",
      "- Built things",
    ].join("\n");

    const entries = parseExperience(text);
    expect(entries.length).toBe(1);
    expect(entries[0].company).toBe("Google");
    expect(entries[0].title).toBe("Software Engineer");
  });

  it("should handle single entry with no bullets", () => {
    const text = [
      "Manager at BigCorp",
      "Mar 2021 - Present",
    ].join("\n");

    const entries = parseExperience(text);
    expect(entries.length).toBe(1);
    expect(entries[0].bullets).toEqual([]);
  });

  it("should handle entry with many bullets", () => {
    const text = [
      "Lead Engineer at TechCo",
      "Jan 2020 - Present",
      "- Bullet 1",
      "- Bullet 2",
      "- Bullet 3",
      "- Bullet 4",
      "- Bullet 5",
    ].join("\n");

    const entries = parseExperience(text);
    expect(entries.length).toBe(1);
    expect(entries[0].bullets.length).toBe(5);
  });

  it("should return empty array when no entries found", () => {
    const entries = parseExperience("");
    expect(entries).toEqual([]);
  });
});
