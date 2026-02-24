import { describe, expect, it } from "vitest";
import { AIOrchestrator } from "@/modules/ai/orchestrator";
import { MockAIProvider } from "@/modules/ai/providers/mock";

describe("AIOrchestrator", () => {
  const orchestrator = new AIOrchestrator(new MockAIProvider({ delay: 1 }));

  it("enhances one bullet", async () => {
    const result = await orchestrator.enhanceBullet("Built APIs");
    expect(result.original).toBeTruthy();
    expect(result.enhanced).toBeTruthy();
  });

  it("enhances many bullets", async () => {
    const result = await orchestrator.enhanceBullets(["Built APIs", "Led project"]);
    expect(result).toHaveLength(2);
  });

  it("generates summary", async () => {
    const result = await orchestrator.generateSummary({ title: "Engineer" });
    expect(result.summary).toBeTruthy();
    expect(Array.isArray(result.alternatives)).toBe(true);
  });

  it("extracts keywords", async () => {
    const result = await orchestrator.extractKeywords("Extract keywords from this job description");
    expect(Array.isArray(result.hardSkills)).toBe(true);
  });

  it("analyzes skill gaps", async () => {
    const result = await orchestrator.analyzeSkillGap({
      resumeSkills: ["TypeScript", "React"],
      jobKeywords: ["TypeScript", "React", "Kubernetes"],
    });
    expect(Array.isArray(result.missingSkills)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });

  it("tailors a resume", async () => {
    const result = await orchestrator.tailorResume({
      summary: "Backend engineer",
      bullets: ["Built APIs"],
      jobDescription: "Tailor this resume for a senior backend role",
    });
    expect(result.tailoredSummary).toBeTruthy();
    expect(Array.isArray(result.bulletSuggestions)).toBe(true);
  });
});
