# 1. High-Level System Architecture

> **Excalidraw Diagram**: Open `diagrams/01-system-architecture.excalidraw` in [excalidraw.com](https://excalidraw.com)
> **Image**: `diagrams/01-system-architecture.png`

## Architecture Overview

TechResume AI is a **modular monolith** deployed as a single Next.js application on Vercel's free tier. All services run within a single deployment unit but are organized as distinct internal modules with clear boundaries.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VERCEL (Free Tier)                            │
│  ┌────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐   │
│  │   Next.js Client   │  │   API Routes Layer   │  │  Server Actions   │   │
│  │   (React RSC)      │  │   (/api/*)           │  │  (mutations)      │   │
│  │                    │  │                      │  │                   │   │
│  │  • Resume Editor   │  │  • /api/resume/*     │  │  • saveResume()   │   │
│  │  • Dashboard       │  │  • /api/ats/*        │  │  • runATS()       │   │
│  │  • JD Matcher      │  │  • /api/match/*      │  │  • matchJD()      │   │
│  │  • Export Page     │  │  • /api/ai/*         │  │  • enhance()      │   │
│  │  • Ad Slots        │  │  • /api/export/*     │  │                   │   │
│  └────────────────────┘  └──────────┬───────────┘  └───────────────────┘   │
│                                     │                                      │
│                    ┌────────────────┼────────────────┐                     │
│                    │                │                │                     │
│              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐              │
│              │  Auth      │  │  AI Module  │  │  Queue     │              │
│              │  NextAuth  │  │  LLM Router │  │  QStash    │              │
│              └─────┬──────┘  └──────┬──────┘  └─────┬──────┘              │
└────────────────────┼────────────────┼───────────────┼─────────────────────┘
                     │                │               │
     ┌───────────────┼────────────────┼───────────────┼───────────────┐
     │               │                │               │               │
┌────▼────┐   ┌──────▼──────┐  ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
│ Neon    │   │ Upstash     │  │ Cloudflare│  │ Gemini    │  │ Sentry    │
│ Postgres│   │ Redis +     │  │ R2        │  │ API       │  │ (free)    │
│ (free)  │   │ QStash      │  │ (free)    │  │ (free)    │  │           │
│ 0.5 GB  │   │ (free)      │  │ 10 GB     │  │ 15 RPM    │  │ 5k events │
└─────────┘   └─────────────┘  └───────────┘  └───────────┘  └───────────┘
```

## Request Flow Diagrams

### Flow A: Resume Upload + Parse (Async — ≤10s total)

```
User ──upload──▶ API Route ──validate──▶ R2 Storage
                                            │
                              ┌─────────────┘
                              ▼
                    QStash enqueue (async)
                              │
                              ▼
                    Parser Worker (serverless fn)
                    ├── Extract text (pdf-parse / mammoth)
                    ├── Detect sections (regex heuristics)
                    ├── Build canonical JSON
                    ├── Extract keywords
                    └── Store in PostgreSQL
                              │
                              ▼
                    Cache parsed result in Redis
                              │
                              ▼
                    Client polls GET /api/resume/:id/status
```

**Sync portion** (< 1s): File validation + upload to R2 + enqueue  
**Async portion** (3–10s): Text extraction + structuring + DB write  
**Client UX**: Upload returns immediately; client polls for completion with a progress indicator.

### Flow B: JD Match Scoring (Sync — < 3s)

```
User ──paste JD──▶ API Route
                      │
                      ├── Check Redis cache (JD hash + resume version)
                      │   └── HIT → return cached score
                      │
                      ├── Parse JD text → extract keywords/skills
                      ├── Load resume structured JSON from cache/DB
                      ├── Compute TF-IDF similarity
                      ├── Compute keyword overlap %
                      ├── Compute section-by-section matching
                      ├── Aggregate weighted score
                      └── Cache result (TTL: 24h)
                      │
                      ▼
                    Return {score, matched, missing, suggestions}
```

**Entirely synchronous** — no LLM call. Pure heuristic + TF-IDF.  
**Target**: < 2s p95 (mostly string operations + cached data).

### Flow C: Bullet Point Rewrite (Sync + Streaming — < 8s)

```
User ──select bullet──▶ API Route
                           │
                           ├── Check Redis cache (bullet hash)
                           │   └── HIT → return cached rewrite
                           │
                           ├── Load prompt template (versioned)
                           ├── Estimate tokens (abort if > budget)
                           ├── Route to LLM (Gemini Flash preferred)
                           ├── Stream response chunks to client
                           └── On complete: cache result (TTL: 72h)
                           │
                           ▼
                         Client renders streamed text progressively
```

**Sync + streaming** — first token in < 2s, full response < 8s.  
**LLM used here**: This is one of the few flows that requires an LLM call.

## Synchronous vs Asynchronous Flow Summary

| Flow | Type | Target Latency | LLM Required? |
|------|------|----------------|---------------|
| Resume CRUD | Sync | < 500ms | No |
| Resume Upload + Parse | **Async** | < 10s total | No |
| ATS Score Generation | Sync | < 3s | No (heuristic) |
| JD Match Scoring | Sync | < 3s | No (TF-IDF) |
| Bullet Enhancement | Sync + Stream | < 8s | **Yes** |
| Resume Tailoring | Sync + Stream | < 8s | **Yes** |
| PDF Export | **Async** | < 5s | No |
| Skill Gap Detection | Sync | < 2s | No (set operations) |
| Keyword Extraction | Sync | < 1s | No (NLP heuristic) |

> **Design principle**: LLMs are used ONLY for generative tasks (rewrites, suggestions). All scoring and analysis is deterministic/heuristic-first.
