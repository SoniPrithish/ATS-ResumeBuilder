import { describe, it, expect } from "vitest";
import { extractSkills } from "@/modules/parser/skills-extractor";

describe("extractSkills", () => {
  it("should parse comma-separated list", () => {
    const text = "Python, Java, JavaScript, React, Docker";

    const skills = extractSkills(text);

    expect(skills.languages).toContain("Python");
    expect(skills.languages).toContain("Java");
    expect(skills.languages).toContain("JavaScript");
    expect(skills.tools).toContain("Docker");
  });

  it("should parse categorized with headers", () => {
    const text = [
      "Languages: Python, Java, JavaScript",
      "Frameworks: React, Django",
      "Tools: Docker, Git, Jenkins",
    ].join("\n");

    const skills = extractSkills(text);

    expect(skills.languages!.length).toBeGreaterThanOrEqual(2);
    expect(skills.tools!.length).toBeGreaterThanOrEqual(2);
  });

  it("should parse bullet list", () => {
    const text = [
      "- Python",
      "- React",
      "- Docker",
      "- Leadership",
    ].join("\n");

    const skills = extractSkills(text);

    expect(skills.languages).toContain("Python");
    expect(skills.tools).toContain("Docker");
    expect(skills.soft).toContain("Leadership");
  });

  it("should handle mixed format", () => {
    const text = [
      "Languages: Python, Java | React, Docker",
      "- Machine Learning",
      "- Communication",
    ].join("\n");

    const skills = extractSkills(text);

    expect(skills.languages!.length).toBeGreaterThanOrEqual(1);
    expect(skills.soft).toContain("Communication");
  });

  it("should place unknown skills in technical", () => {
    const text = "QuantumFlux, HyperBeam, NeuroSync";

    const skills = extractSkills(text);

    // Unknown skills go to technical
    expect(skills.technical.length).toBeGreaterThanOrEqual(3);
  });

  it("should return empty SkillSet for empty section", () => {
    const skills = extractSkills("");

    expect(skills.technical).toEqual([]);
    expect(skills.soft).toEqual([]);
    expect(skills.tools).toEqual([]);
    expect(skills.languages).toEqual([]);
  });

  it("should handle pipe-separated skills", () => {
    const text = "Python | Java | Kubernetes | Terraform";

    const skills = extractSkills(text);

    expect(skills.languages).toContain("Python");
    expect(skills.tools).toContain("Kubernetes");
  });
});
