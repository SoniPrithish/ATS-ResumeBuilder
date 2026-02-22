import { describe, it, expect } from "vitest";
import {
  parseLinkedInPdf,
  isLinkedInFormat,
} from "@/modules/parser/linkedin-pdf-parser";

describe("isLinkedInFormat", () => {
  it("should detect LinkedIn format by URL", () => {
    const text = "John Doe\nlinkedin.com/in/johndoe\nExperience\nEducation";
    expect(isLinkedInFormat(text)).toBe(true);
  });

  it("should detect LinkedIn format by section naming", () => {
    const text = [
      "John Doe",
      "Software Engineer",
      "San Francisco, CA",
      "Experience",
      "Education",
      "Skills",
      "Licenses & Certifications",
    ].join("\n");

    expect(isLinkedInFormat(text)).toBe(true);
  });

  it("should not detect non-LinkedIn text", () => {
    const text = "Simple resume text with no LinkedIn markers";
    expect(isLinkedInFormat(text)).toBe(false);
  });
});

describe("parseLinkedInPdf", () => {
  it("should parse standard LinkedIn PDF text", () => {
    const text = [
      "John Doe",
      "Senior Software Engineer at Google",
      "San Francisco, CA",
      "",
      "Experience",
      "Senior Software Engineer",
      "Google",
      "Jan 2020 - Present",
      "Built amazing things",
      "",
      "Education",
      "Stanford University",
      "Bachelor of Science, Computer Science",
      "2016 - 2020",
      "",
      "Skills",
      "Python",
      "JavaScript",
      "React",
    ].join("\n");

    const result = parseLinkedInPdf(text);

    expect(result.contactInfo.fullName).toBe("John Doe");
    expect(result.contactInfo.location).toBe("San Francisco, CA");
    expect(result.summary).toContain("Senior Software Engineer");
  });

  it("should parse LinkedIn PDF with minimal sections", () => {
    const text = [
      "Jane Smith",
      "Product Manager",
      "New York, NY",
      "",
      "Experience",
      "Product Manager",
      "Meta",
      "Mar 2021 - Present",
      "Led product strategy",
    ].join("\n");

    const result = parseLinkedInPdf(text);

    expect(result.contactInfo.fullName).toBe("Jane Smith");
    expect(result.experience.length).toBeGreaterThanOrEqual(1);
  });
});
