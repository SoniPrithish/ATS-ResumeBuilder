import { describe, it, expect } from "vitest";
import { detectSections } from "@/modules/parser/section-detector";

describe("detectSections", () => {
  it("should detect standard headers (EXPERIENCE, Education, Skills)", () => {
    const text = [
      "John Doe",
      "john@example.com",
      "",
      "EXPERIENCE",
      "Software Engineer at Google",
      "Jan 2020 - Present",
      "",
      "Education",
      "BS Computer Science at MIT",
      "",
      "Skills",
      "Python, Java, TypeScript",
    ].join("\n");

    const sections = detectSections(text);

    expect(sections.length).toBe(3);
    expect(sections[0].type).toBe("experience");
    expect(sections[1].type).toBe("education");
    expect(sections[2].type).toBe("skills");
  });

  it("should detect varied formats (Title Case, UPPERCASE, with colons)", () => {
    const text = [
      "WORK EXPERIENCE:",
      "Engineer",
      "",
      "Education ---",
      "BS CS",
      "",
      "Technical Skills:",
      "React",
    ].join("\n");

    const sections = detectSections(text);

    expect(sections.length).toBe(3);
    expect(sections[0].type).toBe("experience");
    expect(sections[1].type).toBe("education");
    expect(sections[2].type).toBe("skills");
  });

  it("should detect multiple sections in sequence", () => {
    const text = [
      "Professional Summary",
      "Experienced developer",
      "",
      "Work Experience",
      "Developer at Corp",
      "",
      "Projects",
      "My Project",
      "",
      "Certifications",
      "AWS SAA",
    ].join("\n");

    const sections = detectSections(text);

    expect(sections.length).toBe(4);
    expect(sections[0].type).toBe("summary");
    expect(sections[1].type).toBe("experience");
    expect(sections[2].type).toBe("projects");
    expect(sections[3].type).toBe("certifications");
  });

  it("should return empty array when no headers found", () => {
    const text = [
      "This is just plain text",
      "with no section headers",
      "at all",
    ].join("\n");

    const sections = detectSections(text);
    expect(sections).toEqual([]);
  });

  it("should return empty array for empty text", () => {
    expect(detectSections("")).toEqual([]);
    expect(detectSections("   ")).toEqual([]);
  });

  it("should capture rawContent correctly between sections", () => {
    const text = [
      "Experience",
      "Line 1",
      "Line 2",
      "Line 3",
      "Education",
      "Line 4",
      "Line 5",
    ].join("\n");

    const sections = detectSections(text);

    expect(sections.length).toBe(2);
    expect(sections[0].rawContent).toContain("Line 1");
    expect(sections[0].rawContent).toContain("Line 3");
    expect(sections[0].rawContent).not.toContain("Line 4");
    expect(sections[1].rawContent).toContain("Line 4");
    expect(sections[1].rawContent).toContain("Line 5");
  });

  it("should detect summary section headers", () => {
    const text = "About Me\nI am a developer";
    const sections = detectSections(text);
    expect(sections.length).toBe(1);
    expect(sections[0].type).toBe("summary");
  });

  it("should reject lines > 50 chars as headers", () => {
    const text =
      "This is a very long line that should not be detected as a section header at all experience";
    const sections = detectSections(text);
    expect(sections).toEqual([]);
  });
});
