/**
 * @module tests/unit/helpers/factories.test
 * @description Tests verifying factory functions produce valid typed data.
 */

import { describe, it, expect } from "vitest";
import {
    createMockContactInfo,
    createMockExperience,
    createMockEducation,
    createMockSkillSet,
    createMockProject,
    createMockCertification,
    createMockResume,
    createMockATSScore,
    createMockATSBreakdown,
    createMockATSSuggestion,
    createMockCategoryScore,
    createMockJobDescription,
    createMockMatchResult,
    createMockSkillGap,
    createMockUser,
    createMockExtractedKeywords,
} from "../../helpers/factories";

describe("Factory: createMockContactInfo", () => {
    it("produces valid contact info", () => {
        const contact = createMockContactInfo();
        expect(contact.fullName).toBe("Jane Doe");
        expect(contact.email).toContain("@");
    });

    it("accepts overrides", () => {
        const contact = createMockContactInfo({ fullName: "John Smith" });
        expect(contact.fullName).toBe("John Smith");
        expect(contact.email).toBe("jane@example.com"); // default preserved
    });
});

describe("Factory: createMockExperience", () => {
    it("produces valid experience entry", () => {
        const exp = createMockExperience();
        expect(exp.id).toBeDefined();
        expect(exp.company).toBeTruthy();
        expect(exp.title).toBeTruthy();
        expect(Array.isArray(exp.bullets)).toBe(true);
        expect(exp.bullets.length).toBeGreaterThan(0);
    });

    it("accepts overrides", () => {
        const exp = createMockExperience({ company: "NewCorp" });
        expect(exp.company).toBe("NewCorp");
    });
});

describe("Factory: createMockEducation", () => {
    it("produces valid education entry", () => {
        const edu = createMockEducation();
        expect(edu.institution).toBeTruthy();
        expect(edu.degree).toBeTruthy();
        expect(edu.field).toBeTruthy();
    });
});

describe("Factory: createMockSkillSet", () => {
    it("produces valid skill set", () => {
        const skills = createMockSkillSet();
        expect(Array.isArray(skills.technical)).toBe(true);
        expect(skills.technical.length).toBeGreaterThan(0);
        expect(Array.isArray(skills.soft)).toBe(true);
        expect(Array.isArray(skills.tools)).toBe(true);
    });
});

describe("Factory: createMockProject", () => {
    it("produces valid project entry", () => {
        const proj = createMockProject();
        expect(proj.name).toBeTruthy();
        expect(proj.description).toBeTruthy();
        expect(Array.isArray(proj.technologies)).toBe(true);
    });
});

describe("Factory: createMockCertification", () => {
    it("produces valid certification", () => {
        const cert = createMockCertification();
        expect(cert.name).toBeTruthy();
        expect(cert.issuer).toBeTruthy();
        expect(cert.date).toBeTruthy();
    });
});

describe("Factory: createMockResume", () => {
    it("produces a full canonical resume", () => {
        const resume = createMockResume();
        expect(resume.contactInfo).toBeDefined();
        expect(resume.contactInfo.fullName).toBeTruthy();
        expect(resume.summary).toBeTruthy();
        expect(Array.isArray(resume.experience)).toBe(true);
        expect(Array.isArray(resume.education)).toBe(true);
        expect(resume.skills).toBeDefined();
    });

    it("accepts nested overrides", () => {
        const resume = createMockResume({
            contactInfo: createMockContactInfo({ fullName: "Override User" }),
        });
        expect(resume.contactInfo.fullName).toBe("Override User");
    });
});

describe("Factory: ATS types", () => {
    it("createMockCategoryScore produces valid score", () => {
        const score = createMockCategoryScore();
        expect(score.score).toBeGreaterThanOrEqual(0);
        expect(score.maxScore).toBeGreaterThanOrEqual(score.score);
        expect(score.category).toBeTruthy();
    });

    it("createMockATSBreakdown has all categories", () => {
        const breakdown = createMockATSBreakdown();
        expect(breakdown.keywords).toBeDefined();
        expect(breakdown.formatting).toBeDefined();
        expect(breakdown.experience).toBeDefined();
        expect(breakdown.education).toBeDefined();
        expect(breakdown.skills).toBeDefined();
    });

    it("createMockATSSuggestion produces valid suggestion", () => {
        const sug = createMockATSSuggestion();
        expect(sug.id).toBeTruthy();
        expect(sug.category).toBeTruthy();
        expect(["high", "medium", "low"]).toContain(sug.priority);
        expect(sug.message).toBeTruthy();
    });

    it("createMockATSScore produces complete ATS score", () => {
        const ats = createMockATSScore();
        expect(ats.overallScore).toBeGreaterThanOrEqual(0);
        expect(ats.breakdown).toBeDefined();
        expect(Array.isArray(ats.suggestions)).toBe(true);
        expect(ats.analyzedAt).toBeTruthy();
    });
});

describe("Factory: Job Description types", () => {
    it("createMockExtractedKeywords produces keywords", () => {
        const kw = createMockExtractedKeywords();
        expect(Array.isArray(kw.required)).toBe(true);
        expect(Array.isArray(kw.preferred)).toBe(true);
        expect(kw.required.length).toBeGreaterThan(0);
    });

    it("createMockJobDescription produces full JD", () => {
        const jd = createMockJobDescription();
        expect(jd.title).toBeTruthy();
        expect(jd.company).toBeTruthy();
        expect(jd.keywords).toBeDefined();
        expect(jd.experienceLevel).toBeTruthy();
        expect(Array.isArray(jd.responsibilities)).toBe(true);
    });

    it("createMockSkillGap produces valid gap", () => {
        const gap = createMockSkillGap();
        expect(gap.skill).toBeTruthy();
        expect(["required", "preferred"]).toContain(gap.importance);
        expect(gap.suggestion).toBeTruthy();
    });

    it("createMockMatchResult produces valid result", () => {
        const match = createMockMatchResult();
        expect(match.overallScore).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(match.matchedKeywords)).toBe(true);
        expect(Array.isArray(match.missingKeywords)).toBe(true);
        expect(Array.isArray(match.skillGaps)).toBe(true);
    });
});

describe("Factory: createMockUser", () => {
    it("produces valid user record", () => {
        const user = createMockUser();
        expect(user.id).toBeTruthy();
        expect(user.name).toBeTruthy();
        expect(user.email).toContain("@");
        expect(user.subscriptionTier).toBe("free");
    });

    it("accepts overrides", () => {
        const user = createMockUser({ name: "Custom User" });
        expect(user.name).toBe("Custom User");
    });
});
