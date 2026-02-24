/**
 * @module prisma/seed
 * @description Database seed script. Creates test user, sample resumes,
 * and job descriptions for development.
 *
 * Run with: pnpm db:seed
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 Seeding database...");

    // ── Create test user ───────────────────────────────────
    const user = await prisma.user.upsert({
        where: { email: "dev@techresume.ai" },
        update: {},
        create: {
            name: "Dev User",
            email: "dev@techresume.ai",
            emailVerified: new Date(),
            image: "https://avatars.githubusercontent.com/u/1234567",
            subscriptionTier: "FREE",
        },
    });

    console.log(`✅ User created: ${user.name} (${user.id})`);

    // ── Create sample resumes ──────────────────────────────
    const resumes = await Promise.all([
        prisma.resume.create({
            data: {
                userId: user.id,
                title: "Full-Stack Developer Resume",
                status: "COMPLETE",
                contactInfo: {
                    fullName: "Dev User",
                    email: "dev@techresume.ai",
                    phone: "+1-555-000-0001",
                    location: "San Francisco, CA",
                    linkedin: "https://linkedin.com/in/devuser",
                    github: "https://github.com/devuser",
                },
                summary:
                    "Full-stack developer with 4+ years of experience building scalable web applications with React, Node.js, and PostgreSQL.",
                experience: [
                    {
                        id: "exp-seed-1",
                        company: "TechStartup Inc.",
                        title: "Full-Stack Developer",
                        location: "San Francisco, CA",
                        startDate: "2022-01",
                        current: true,
                        bullets: [
                            "Built and maintained customer-facing dashboard with React and TypeScript",
                            "Designed RESTful APIs serving 500K+ daily requests with Node.js and Express",
                            "Implemented CI/CD pipeline reducing deployment time by 60%",
                        ],
                        technologies: ["React", "TypeScript", "Node.js", "PostgreSQL"],
                    },
                    {
                        id: "exp-seed-2",
                        company: "Digital Agency Co.",
                        title: "Junior Developer",
                        location: "Remote",
                        startDate: "2020-06",
                        endDate: "2021-12",
                        current: false,
                        bullets: [
                            "Developed responsive web applications for 10+ client projects",
                            "Collaborated with design team to implement pixel-perfect UIs",
                        ],
                        technologies: ["JavaScript", "React", "CSS", "Firebase"],
                    },
                ],
                education: [
                    {
                        id: "edu-seed-1",
                        institution: "UC Berkeley",
                        degree: "Bachelor of Science",
                        field: "Computer Science",
                        startDate: "2016-08",
                        endDate: "2020-05",
                        gpa: "3.7",
                    },
                ],
                skills: {
                    technical: [
                        "TypeScript",
                        "React",
                        "Node.js",
                        "PostgreSQL",
                        "Python",
                    ],
                    soft: ["Communication", "Problem Solving", "Team Leadership"],
                    tools: ["Git", "Docker", "VS Code", "Jira"],
                },
                lastAtsScore: 82,
            },
        }),
        prisma.resume.create({
            data: {
                userId: user.id,
                title: "Backend Engineer Resume",
                status: "DRAFT",
                contactInfo: {
                    fullName: "Dev User",
                    email: "dev@techresume.ai",
                    location: "San Francisco, CA",
                },
                summary:
                    "Backend engineer specializing in distributed systems, API design, and cloud infrastructure.",
                experience: [
                    {
                        id: "exp-seed-3",
                        company: "CloudScale Corp.",
                        title: "Backend Engineer",
                        startDate: "2021-03",
                        current: true,
                        bullets: [
                            "Architected microservices handling 1M+ events/day",
                            "Reduced infrastructure costs by 35% through optimization",
                        ],
                        technologies: ["Go", "Python", "Kubernetes", "AWS"],
                    },
                ],
                education: [
                    {
                        id: "edu-seed-2",
                        institution: "UC Berkeley",
                        degree: "Bachelor of Science",
                        field: "Computer Science",
                        startDate: "2016-08",
                        endDate: "2020-05",
                    },
                ],
                skills: {
                    technical: ["Go", "Python", "Kubernetes", "AWS", "PostgreSQL"],
                    soft: ["System Design", "Documentation"],
                    tools: ["Docker", "Terraform", "Grafana"],
                },
            },
        }),
        prisma.resume.create({
            data: {
                userId: user.id,
                title: "ML Engineer Resume (Archived)",
                status: "ARCHIVED",
                contactInfo: {
                    fullName: "Dev User",
                    email: "dev@techresume.ai",
                },
                summary:
                    "Machine learning engineer with experience in NLP and computer vision.",
                experience: [],
                education: [
                    {
                        id: "edu-seed-3",
                        institution: "Stanford University",
                        degree: "Master of Science",
                        field: "Computer Science (ML Track)",
                        startDate: "2020-09",
                        endDate: "2022-06",
                    },
                ],
                skills: {
                    technical: ["Python", "PyTorch", "TensorFlow", "scikit-learn"],
                    soft: ["Research", "Technical Writing"],
                    tools: ["Jupyter", "Weights & Biases", "MLflow"],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${resumes.length} sample resumes`);

    // ── Create job descriptions ────────────────────────────
    const jobDescriptions = await Promise.all([
        prisma.jobDescription.create({
            data: {
                userId: user.id,
                title: "Senior Full-Stack Engineer",
                company: "InnovateTech",
                rawText: `We are looking for a Senior Full-Stack Engineer to join our growing team.

Requirements:
- 5+ years of software engineering experience
- Strong TypeScript and React skills
- Experience with Node.js and PostgreSQL
- Familiarity with cloud platforms (AWS/GCP)
- Experience with CI/CD pipelines

Nice to have:
- GraphQL experience
- Kubernetes/Docker
- Open source contributions`,
                parsedData: {
                    title: "Senior Full-Stack Engineer",
                    company: "InnovateTech",
                    location: "Remote",
                    experienceLevel: "senior",
                    keywords: {
                        required: ["TypeScript", "React", "Node.js", "PostgreSQL"],
                        preferred: ["GraphQL", "Kubernetes", "Docker"],
                        technologies: [
                            "TypeScript",
                            "React",
                            "Node.js",
                            "PostgreSQL",
                            "AWS",
                            "GCP",
                        ],
                        softSkills: ["Team collaboration", "Communication"],
                    },
                    responsibilities: [
                        "Build and maintain full-stack features",
                        "Design scalable APIs",
                        "Mentor junior engineers",
                    ],
                    qualifications: [
                        "5+ years of software engineering",
                        "Strong TypeScript and React skills",
                    ],
                },
            },
        }),
        prisma.jobDescription.create({
            data: {
                userId: user.id,
                title: "Backend Developer",
                company: "DataFlow Systems",
                rawText: `Backend Developer position at DataFlow Systems.

We need someone who can:
- Design and implement RESTful APIs
- Work with large-scale data pipelines
- Write clean, testable code

Requirements:
- 3+ years backend development
- Proficient in Python or Go
- Database design (PostgreSQL, Redis)
- Message queue experience (Kafka, RabbitMQ)`,
                parsedData: {
                    title: "Backend Developer",
                    company: "DataFlow Systems",
                    experienceLevel: "mid",
                    keywords: {
                        required: ["Python", "Go", "PostgreSQL", "Redis"],
                        preferred: ["Kafka", "RabbitMQ"],
                        technologies: [
                            "Python",
                            "Go",
                            "PostgreSQL",
                            "Redis",
                            "Kafka",
                            "RabbitMQ",
                        ],
                        softSkills: ["Clean code", "Testing"],
                    },
                    responsibilities: [
                        "Design and implement RESTful APIs",
                        "Work with large-scale data pipelines",
                    ],
                    qualifications: [
                        "3+ years backend development",
                        "Proficient in Python or Go",
                    ],
                },
            },
        }),
    ]);

    console.log(`✅ Created ${jobDescriptions.length} sample job descriptions`);
    console.log("🌱 Seeding complete!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
