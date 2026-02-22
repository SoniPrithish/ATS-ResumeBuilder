import { describe, it, expect } from "vitest";
import { parseEducation } from "@/modules/parser/education-parser";

describe("parseEducation", () => {
  it("should parse standard entry (BS CS at MIT, 2024)", () => {
    const text = [
      "Bachelor of Science in Computer Science",
      "Massachusetts Institute of Technology",
      "2020 - 2024",
      "GPA: 3.8/4.0",
    ].join("\n");

    const entries = parseEducation(text);

    expect(entries.length).toBe(1);
    expect(entries[0].degree).toContain("Bachelor");
    expect(entries[0].field).toBe("Computer Science");
    expect(entries[0].institution).toContain("Massachusetts");
    expect(entries[0].gpa).toBe("3.8/4.0");
  });

  it("should parse multiple degrees", () => {
    const text = [
      "M.S. in Data Science",
      "Stanford University",
      "2022 - 2024",
      "",
      "B.S. in Computer Science",
      "UC Berkeley",
      "2018 - 2022",
    ].join("\n");

    const entries = parseEducation(text);
    expect(entries.length).toBe(2);
  });

  it("should handle various GPA formats", () => {
    const text = [
      "B.S. in Engineering",
      "MIT",
      "3.9 GPA",
    ].join("\n");

    const entries = parseEducation(text);
    expect(entries.length).toBe(1);
    expect(entries[0].gpa).toBeDefined();
  });

  it("should parse coursework list", () => {
    const text = [
      "B.S. in Computer Science",
      "Stanford University",
      "2020 - 2024",
      "Coursework: Data Structures, Algorithms, Machine Learning, Databases",
    ].join("\n");

    const entries = parseEducation(text);
    expect(entries.length).toBe(1);
    expect(entries[0].coursework).toBeDefined();
    expect(entries[0].coursework!.length).toBeGreaterThanOrEqual(3);
  });

  it("should handle minimal info (just institution + year)", () => {
    const text = "University of California 2023";

    const entries = parseEducation(text);
    expect(entries.length).toBe(1);
    expect(entries[0].institution).toContain("University");
  });

  it("should return empty array for empty text", () => {
    expect(parseEducation("")).toEqual([]);
  });
});
