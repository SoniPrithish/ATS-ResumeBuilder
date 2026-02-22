# TechResume AI — Architecture Design Document

> **Version**: 1.0.0 | **Author**: Architecture Team | **Date**: 2026-02-21
> **Status**: Draft — Ready for Review

## Table of Contents

| # | Section | File |
|---|---------|------|
| 0 | Overview, Assumptions, SLOs | `00-OVERVIEW.md` (this file) |
| 1 | High-Level System Architecture | `01-system-architecture.md` |
| 2 | Monolith-First Architecture | `02-monolith-architecture.md` |
| 3 | Database Schema Design | `03-database-schema.md` |
| 4 | Resume Parsing Pipeline | `04-resume-parsing.md` |
| 5 | ATS Scoring Algorithm | `05-ats-scoring.md` |
| 6 | JD Comparison Engine | `06-jd-comparison.md` |
| 7 | Skill Gap Detection | `07-skill-gap.md` |
| 8 | AI Prompt Orchestration | `08-ai-orchestration.md` |
| 9 | Caching Strategy | `09-caching.md` |
| 10 | Background Job System | `10-background-jobs.md` |
| 11 | GitHub Version Management | `11-github-versions.md` |
| 12 | LinkedIn Import | `12-linkedin-import.md` |
| 13 | Ad Integration | `13-ad-integration.md` |
| 14 | Deployment Architecture | `14-deployment.md` |
| 15 | CI/CD Pipeline | `15-cicd.md` |
| 16 | Cost Optimization | `16-cost-optimization.md` |
| 17 | Security | `17-security.md` |
| 18 | Scaling Strategy | `18-scaling.md` |
| 19 | Paid Tier Path | `19-paid-tier.md` |

## Excalidraw Diagrams

All interactive diagrams are in `diagrams/`:

| Diagram | File |
|---------|------|
| System Architecture | `diagrams/01-system-architecture.excalidraw` |
| Resume Parsing Pipeline | `diagrams/02-resume-parsing-pipeline.excalidraw` |
| AI Orchestration Flow | `diagrams/03-ai-orchestration.excalidraw` |
| Free-Tier Deployment | `diagrams/04-deployment-free-tier.excalidraw` |
| Scaled AWS Deployment | `diagrams/05-deployment-scale.excalidraw` |
| CI/CD Pipeline | `diagrams/06-cicd-pipeline.excalidraw` |

> Open `.excalidraw` files at [excalidraw.com](https://excalidraw.com) or in VS Code with the Excalidraw extension.

---

## Assumptions

| Parameter | Assumed Value | Rationale |
|-----------|---------------|-----------|
| **MAU (Month 1–3)** | 100–500 | Organic growth, Product Hunt launch |
| **DAU** | ~15% of MAU | Typical for productivity tools |
| **Peak RPS** | 5–10 req/s | Concentrated during US business hours |
| **Avg resume file size** | 200–500 KB | PDF/DOCX, text-heavy |
| **Max file size** | 5 MB | Hard limit — rejects larger |
| **Avg LLM calls/user/session** | 3–5 | Parse + score + 1-2 rewrites |
| **Resume versions/user** | 2–5 | Most users iterate 2-3 times |
| **Primary region** | US (us-east-1) | Target audience location |
| **Target MVP timeline** | 4–6 weeks | Solo developer |
| **Infrastructure budget** | $0/month at launch | Free tiers only |

## Non-Goals (MVP)

- ❌ Multi-language resume support (English only)
- ❌ Real-time collaborative editing
- ❌ Mobile-native apps (responsive web only)
- ❌ Enterprise/team accounts
- ❌ Custom ATS integrations (Greenhouse, Lever, etc.)
- ❌ Video resume support
- ❌ Cover letter generation (Phase 2)
- ❌ Interview prep features
- ❌ Resume scraping/auto-fill from job boards

## SLOs and SLA Boundaries

| Metric | Target | Notes |
|--------|--------|-------|
| **Availability** | 99.5% (monthly) | ~3.6h downtime/month acceptable on free tier |
| **API p50 latency** | < 500ms | For non-AI endpoints (CRUD, auth, fetch) |
| **API p95 latency** | < 2s | For non-AI endpoints |
| **Resume parse time** | < 10s (p95) | Async — user sees progress indicator |
| **ATS score generation** | < 3s (p95) | Heuristic engine is synchronous |
| **AI suggestion generation** | < 8s (p95) | Streamed response — first token < 2s |
| **PDF export** | < 5s (p95) | Async with download notification |
| **JD match scoring** | < 3s (p95) | Mostly heuristic + cached embeddings |

### What We Can't Guarantee on Free Tier

- **Cold starts**: Vercel serverless functions may cold-start in 1–3s after inactivity
- **DB connection limits**: Neon free tier has 1 active compute — concurrent queries may queue
- **LLM rate limits**: Gemini free tier = 15 RPM — requests may queue during bursts
- **Uptime during provider outages**: No multi-region failover on free tier

---

## Technical Stack Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     TECHRESUME AI STACK                         │
├─────────────────────────────────────────────────────────────────┤
│ Frontend    │ Next.js 14+ (App Router, RSC, Server Actions)    │
│ Backend     │ Next.js API Routes + tRPC (type-safe RPCs)       │
│ Database    │ PostgreSQL on Neon.tech (free 0.5 GB)            │
│ ORM         │ Prisma (type-safe, migrations, seeding)          │
│ Auth        │ NextAuth.js v5 (GitHub + Google OAuth)           │
│ File Store  │ Cloudflare R2 (free 10 GB, S3-compatible)       │
│ Cache       │ Upstash Redis (free 10k commands/day)            │
│ Queue       │ Upstash QStash (free 500 messages/day)           │
│ LLM         │ Gemini 2.0 Flash (free 15 RPM) + Groq fallback  │
│ PDF Parse   │ pdf-parse (npm) + mammoth (DOCX)                │
│ PDF Gen     │ @react-pdf/renderer                              │
│ Analytics   │ Umami (self-hosted on Vercel) or Plausible       │
│ Monitoring  │ Sentry free tier (5k events/month)               │
│ CI/CD       │ GitHub Actions (free for public repos)           │
│ Hosting     │ Vercel Hobby Plan (free)                         │
└─────────────────────────────────────────────────────────────────┘
```
