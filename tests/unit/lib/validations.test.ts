/**
 * @module tests/unit/lib/validations.test
 * @description Unit tests for Zod validation schemas.
 */

import { describe, it, expect } from "vitest";
import {
    contactInfoSchema,
    resumeFormSchema,
    jdFormSchema,
    uploadSchema,
    loginSchema,
    experienceSchema,
    educationSchema,
    skillSetSchema,
    projectSchema,
    certificationSchema,
} from "@/lib/validations";

describe("contactInfoSchema", () => {
    it("validates correct contact info", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "Jane Doe",
            email: "jane@example.com",
            phone: "+1-555-123-4567",
            location: "San Francisco, CA",
        });
        expect(result.success).toBe(true);
    });

    it("requires fullName", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "",
            email: "jane@example.com",
        });
        expect(result.success).toBe(false);
    });

    it("requires valid email", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "Jane",
            email: "not-an-email",
        });
        expect(result.success).toBe(false);
    });

    it("validates optional URL fields", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "Jane",
            email: "jane@example.com",
            linkedin: "https://linkedin.com/in/jane",
            github: "https://github.com/jane",
            website: "https://jane.dev",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid URLs", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "Jane",
            email: "jane@example.com",
            linkedin: "not-a-url",
        });
        expect(result.success).toBe(false);
    });

    it("allows empty string for optional URL fields", () => {
        const result = contactInfoSchema.safeParse({
            fullName: "Jane",
            email: "jane@example.com",
            linkedin: "",
            github: "",
        });
        expect(result.success).toBe(true);
    });
});

describe("experienceSchema", () => {
    it("validates correct experience entry", () => {
        const result = experienceSchema.safeParse({
            id: "exp-1",
            company: "TechCorp",
            title: "Engineer",
            startDate: "2021-01",
            current: true,
            bullets: ["Did thing A", "Did thing B"],
        });
        expect(result.success).toBe(true);
    });

    it("requires company name", () => {
        const result = experienceSchema.safeParse({
            id: "exp-1",
            company: "",
            title: "Engineer",
            startDate: "2021-01",
            current: false,
            bullets: [],
        });
        expect(result.success).toBe(false);
    });

    it("enforces max bullets per experience", () => {
        const result = experienceSchema.safeParse({
            id: "exp-1",
            company: "TechCorp",
            title: "Engineer",
            startDate: "2021-01",
            current: false,
            bullets: Array(11).fill("Bullet point"),
        });
        expect(result.success).toBe(false);
    });
});

describe("educationSchema", () => {
    it("validates correct education entry", () => {
        const result = educationSchema.safeParse({
            id: "edu-1",
            institution: "Stanford",
            degree: "BS",
            field: "Computer Science",
            startDate: "2015-09",
            endDate: "2019-06",
        });
        expect(result.success).toBe(true);
    });

    it("requires institution", () => {
        const result = educationSchema.safeParse({
            id: "edu-1",
            institution: "",
            degree: "BS",
            field: "CS",
            startDate: "2015",
        });
        expect(result.success).toBe(false);
    });
});

describe("skillSetSchema", () => {
    it("validates correct skill set", () => {
        const result = skillSetSchema.safeParse({
            technical: ["TypeScript", "React"],
            soft: ["Communication"],
            tools: ["Git"],
        });
        expect(result.success).toBe(true);
    });

    it("allows optional fields", () => {
        const result = skillSetSchema.safeParse({
            technical: [],
            soft: [],
            tools: [],
        });
        expect(result.success).toBe(true);
    });
});

describe("projectSchema", () => {
    it("validates correct project", () => {
        const result = projectSchema.safeParse({
            id: "proj-1",
            name: "My Project",
            description: "A cool project",
            technologies: ["React"],
        });
        expect(result.success).toBe(true);
    });

    it("requires project name", () => {
        const result = projectSchema.safeParse({
            id: "proj-1",
            name: "",
            description: "A project",
            technologies: [],
        });
        expect(result.success).toBe(false);
    });
});

describe("certificationSchema", () => {
    it("validates correct certification", () => {
        const result = certificationSchema.safeParse({
            id: "cert-1",
            name: "AWS Solutions Architect",
            issuer: "AWS",
            date: "2023-03",
        });
        expect(result.success).toBe(true);
    });

    it("requires issuer", () => {
        const result = certificationSchema.safeParse({
            id: "cert-1",
            name: "AWS",
            issuer: "",
            date: "2023-03",
        });
        expect(result.success).toBe(false);
    });
});

describe("resumeFormSchema", () => {
    const validResume = {
        title: "My Resume",
        contactInfo: {
            fullName: "Jane Doe",
            email: "jane@example.com",
        },
        summary: "A great developer",
        experience: [],
        education: [],
        skills: {
            technical: [],
            soft: [],
            tools: [],
        },
    };

    it("validates a complete resume form", () => {
        const result = resumeFormSchema.safeParse(validResume);
        expect(result.success).toBe(true);
    });

    it("requires a title", () => {
        const result = resumeFormSchema.safeParse({ ...validResume, title: "" });
        expect(result.success).toBe(false);
    });

    it("enforces max title length", () => {
        const result = resumeFormSchema.safeParse({
            ...validResume,
            title: "a".repeat(101),
        });
        expect(result.success).toBe(false);
    });

    it("enforces max experience entries", () => {
        const result = resumeFormSchema.safeParse({
            ...validResume,
            experience: Array(21).fill({
                id: "exp-1",
                company: "Co",
                title: "Dev",
                startDate: "2021",
                current: true,
                bullets: [],
            }),
        });
        expect(result.success).toBe(false);
    });
});

describe("jdFormSchema", () => {
    it("validates a correct job description", () => {
        const result = jdFormSchema.safeParse({
            title: "Software Engineer",
            company: "TechCorp",
            rawText: "a".repeat(50),
        });
        expect(result.success).toBe(true);
    });

    it("requires minimum text length", () => {
        const result = jdFormSchema.safeParse({
            title: "Engineer",
            company: "Corp",
            rawText: "Too short",
        });
        expect(result.success).toBe(false);
    });

    it("enforces max text length", () => {
        const result = jdFormSchema.safeParse({
            title: "Engineer",
            company: "Corp",
            rawText: "a".repeat(10001),
        });
        expect(result.success).toBe(false);
    });
});

describe("uploadSchema", () => {
    it("validates a PDF upload", () => {
        const result = uploadSchema.safeParse({
            fileName: "resume.pdf",
            fileType: "application/pdf",
            fileSize: 1024 * 1024,
        });
        expect(result.success).toBe(true);
    });

    it("validates a DOCX upload", () => {
        const result = uploadSchema.safeParse({
            fileName: "resume.docx",
            fileType:
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            fileSize: 1024 * 500,
        });
        expect(result.success).toBe(true);
    });

    it("rejects unsupported file types", () => {
        const result = uploadSchema.safeParse({
            fileName: "resume.txt",
            fileType: "text/plain",
            fileSize: 1024,
        });
        expect(result.success).toBe(false);
    });

    it("rejects files larger than 5MB", () => {
        const result = uploadSchema.safeParse({
            fileName: "resume.pdf",
            fileType: "application/pdf",
            fileSize: 6 * 1024 * 1024,
        });
        expect(result.success).toBe(false);
    });
});

describe("loginSchema", () => {
    it("validates correct login data", () => {
        const result = loginSchema.safeParse({
            email: "user@example.com",
        });
        expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
        const result = loginSchema.safeParse({
            email: "invalid",
        });
        expect(result.success).toBe(false);
    });

    it("allows optional callbackUrl", () => {
        const result = loginSchema.safeParse({
            email: "user@example.com",
            callbackUrl: "http://localhost:3000/dashboard",
        });
        expect(result.success).toBe(true);
    });
});
