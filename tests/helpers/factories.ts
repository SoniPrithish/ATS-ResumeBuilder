/**
 * @module tests/helpers/factories
 * @description Factory functions for creating typed test data.
 * Each factory produces objects conforming to the shared canonical types.
 */

import type {
    CanonicalResume,
    ContactInfo,
    ExperienceEntry,
    EducationEntry,
    SkillSet,
    ProjectEntry,
    CertificationEntry,
} from "@/types/resume";
import type {
    ATSScore,
    ATSBreakdown,
    CategoryScore,
    ATSSuggestion,
} from "@/types/ats";
import type {
    ParsedJobDescription,
    ExtractedKeywords,
    MatchResult as JDMatchResult,
    SkillGap,
} from "@/types/job";

// ── Contact Info ───────────────────────────────────────────
export function createMockContactInfo(
    overrides: Partial<ContactInfo> = {}
): ContactInfo {
    return {
        fullName: "Jane Doe",
        email: "jane@example.com",
        phone: "+1-555-123-4567",
        location: "San Francisco, CA",
        linkedin: "https://linkedin.com/in/janedoe",
        github: "https://github.com/janedoe",
        website: "https://janedoe.dev",
        ...overrides,
    };
}

// ── Experience Entry ───────────────────────────────────────
export function createMockExperience(
    overrides: Partial<ExperienceEntry> = {}
): ExperienceEntry {
    return {
        id: "exp-1",
        company: "TechCorp Inc.",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2021-01",
        endDate: "2024-01",
        current: false,
        bullets: [
            "Led development of microservices architecture serving 1M+ users",
            "Reduced API latency by 40% through caching strategies",
            "Mentored 5 junior engineers across 2 teams",
        ],
        technologies: ["TypeScript", "Node.js", "PostgreSQL", "Redis"],
        ...overrides,
    };
}

// ── Education Entry ────────────────────────────────────────
export function createMockEducation(
    overrides: Partial<EducationEntry> = {}
): EducationEntry {
    return {
        id: "edu-1",
        institution: "Stanford University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        startDate: "2015-09",
        endDate: "2019-06",
        gpa: "3.8",
        honors: ["Magna Cum Laude", "Dean's List"],
        coursework: [
            "Data Structures",
            "Algorithms",
            "Machine Learning",
            "Distributed Systems",
        ],
        ...overrides,
    };
}

// ── Skill Set ──────────────────────────────────────────────
export function createMockSkillSet(
    overrides: Partial<SkillSet> = {}
): SkillSet {
    return {
        technical: [
            "TypeScript",
            "Python",
            "React",
            "Node.js",
            "PostgreSQL",
            "Docker",
        ],
        soft: ["Leadership", "Communication", "Problem Solving"],
        tools: ["VS Code", "Git", "Jira", "Figma"],
        languages: ["English (Native)", "Spanish (Conversational)"],
        certifications: ["AWS Solutions Architect"],
        ...overrides,
    };
}

// ── Project Entry ──────────────────────────────────────────
export function createMockProject(
    overrides: Partial<ProjectEntry> = {}
): ProjectEntry {
    return {
        id: "proj-1",
        name: "Open Source CLI Tool",
        description:
            "A developer productivity tool with 500+ GitHub stars for automating repetitive tasks",
        url: "https://github.com/janedoe/cli-tool",
        technologies: ["Rust", "CLI", "GitHub Actions"],
        highlights: [
            "500+ GitHub stars",
            "Published to crates.io",
            "Featured in Rust weekly newsletter",
        ],
        ...overrides,
    };
}

// ── Certification Entry ────────────────────────────────────
export function createMockCertification(
    overrides: Partial<CertificationEntry> = {}
): CertificationEntry {
    return {
        id: "cert-1",
        name: "AWS Solutions Architect – Associate",
        issuer: "Amazon Web Services",
        date: "2023-03",
        expirationDate: "2026-03",
        credentialId: "AWS-SAA-123456",
        url: "https://aws.amazon.com/verification/123456",
        ...overrides,
    };
}

// ── Canonical Resume ───────────────────────────────────────
export function createMockResume(
    overrides: Partial<CanonicalResume> = {}
): CanonicalResume {
    return {
        contactInfo: createMockContactInfo(),
        summary:
            "Senior Software Engineer with 5+ years of experience building scalable applications. Passionate about clean architecture, developer tooling, and open source.",
        experience: [createMockExperience()],
        education: [createMockEducation()],
        skills: createMockSkillSet(),
        projects: [createMockProject()],
        certifications: [createMockCertification()],
        customSections: [],
        ...overrides,
    };
}

// ── ATS Score ──────────────────────────────────────────────
export function createMockCategoryScore(
    overrides: Partial<CategoryScore> = {}
): CategoryScore {
    return {
        category: "keywords",
        score: 75,
        maxScore: 100,
        feedback: "Good keyword coverage but missing some industry-specific terms",
        suggestions: ["Add 'microservices' to your experience section"],
        ...overrides,
    };
}

export function createMockATSBreakdown(
    overrides: Partial<ATSBreakdown> = {}
): ATSBreakdown {
    return {
        keywords: createMockCategoryScore({ category: "keywords", score: 75 }),
        formatting: createMockCategoryScore({ category: "formatting", score: 90 }),
        experience: createMockCategoryScore({ category: "experience", score: 80 }),
        education: createMockCategoryScore({ category: "education", score: 85 }),
        skills: createMockCategoryScore({ category: "skills", score: 70 }),
        ...overrides,
    };
}

export function createMockATSSuggestion(
    overrides: Partial<ATSSuggestion> = {}
): ATSSuggestion {
    return {
        id: "sug-1",
        category: "keywords",
        priority: "high",
        message: 'Add the keyword "microservices" to your experience section',
        currentText: "Built backend services",
        suggestedText: "Built microservices-based backend services",
        section: "experience",
        ...overrides,
    };
}

export function createMockATSScore(
    overrides: Partial<ATSScore> = {}
): ATSScore {
    return {
        overallScore: 78,
        breakdown: createMockATSBreakdown(),
        suggestions: [createMockATSSuggestion()],
        analyzedAt: new Date().toISOString(),
        ...overrides,
    };
}

// ── Job Description ────────────────────────────────────────
export function createMockExtractedKeywords(
    overrides: Partial<ExtractedKeywords> = {}
): ExtractedKeywords {
    return {
        required: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        preferred: ["GraphQL", "Docker", "Kubernetes", "AWS"],
        technologies: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis"],
        softSkills: ["Leadership", "Communication", "Problem Solving"],
        ...overrides,
    };
}

export function createMockJobDescription(
    overrides: Partial<ParsedJobDescription> = {}
): ParsedJobDescription {
    return {
        title: "Senior Full-Stack Engineer",
        company: "InnovateTech",
        location: "Remote",
        experienceLevel: "senior",
        keywords: createMockExtractedKeywords(),
        responsibilities: [
            "Lead development of customer-facing features",
            "Design and implement scalable APIs",
            "Mentor junior engineers",
        ],
        qualifications: [
            "5+ years of software engineering experience",
            "Strong TypeScript and React skills",
            "Experience with PostgreSQL or similar RDBMS",
        ],
        ...overrides,
    };
}

// ── Match Result ───────────────────────────────────────────
export function createMockSkillGap(
    overrides: Partial<SkillGap> = {}
): SkillGap {
    return {
        skill: "Kubernetes",
        importance: "preferred",
        suggestion:
            "Consider adding container orchestration experience or relevant coursework",
        ...overrides,
    };
}

export function createMockMatchResult(
    overrides: Partial<JDMatchResult> = {}
): JDMatchResult {
    return {
        overallScore: 82,
        keywordScore: 78,
        skillsScore: 85,
        experienceScore: 80,
        matchedKeywords: ["TypeScript", "React", "Node.js", "PostgreSQL"],
        missingKeywords: ["GraphQL", "Kubernetes"],
        skillGaps: [createMockSkillGap()],
        suggestions: [
            "Add GraphQL experience to your skills section",
            "Include container orchestration projects",
        ],
        ...overrides,
    };
}

// ── Mock User (for Prisma records) ─────────────────────────
export function createMockUser(overrides: Record<string, unknown> = {}) {
    return {
        id: "user-test-123",
        name: "Test User",
        email: "test@example.com",
        emailVerified: new Date("2024-01-01"),
        image: "https://avatars.githubusercontent.com/u/1234567",
        githubRepoUrl: null,
        subscriptionTier: "free" as const,
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
        ...overrides,
    };
}
