# 2. Monolith-First Architecture

## Why Modular Monolith?

For a **solo developer** shipping an MVP in **4–6 weeks**, a modular monolith is the only sane choice:

| Factor | Monolith ✅ | Microservices ❌ |
|--------|------------|-----------------|
| Deployment complexity | Single `vercel deploy` | Multiple deploys, service discovery |
| Local development | `npm run dev` — done | Docker Compose, multiple processes |
| Debugging | Single log stream, stack traces | Distributed tracing, correlation IDs |
| Cost | 1 free Vercel project | Multiple deployments = multiple bills |
| Shared DB access | Direct imports | API calls or shared DB (anti-pattern) |
| Time to MVP | 4–6 weeks | 3–6 months |
| Team size sweet spot | 1–3 devs | 5+ devs |

**Decision**: Start as a modular monolith. Extract services only when a specific module becomes a bottleneck (likely AI inference at ~10k users).

## Module Boundaries

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Auth pages (login, callback)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── resumes/              # Resume list + editor
│   │   ├── match/                # JD matching interface
│   │   ├── analytics/            # User analytics dashboard
│   │   └── settings/             # User settings
│   ├── api/                      # API Routes
│   │   ├── resume/               # Resume CRUD + parse
│   │   ├── ats/                  # ATS scoring endpoints
│   │   ├── match/                # JD matching endpoints
│   │   ├── ai/                   # AI generation endpoints
│   │   ├── export/               # PDF export endpoints
│   │   └── webhook/              # QStash webhook handlers
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── modules/                      # Internal modules (business logic)
│   ├── auth/                     # Auth config, session helpers
│   │   ├── auth.config.ts
│   │   ├── session.ts
│   │   └── guards.ts
│   │
│   ├── resume/                   # Resume domain logic
│   │   ├── resume.service.ts     # CRUD operations
│   │   ├── resume.parser.ts      # PDF/DOCX parsing pipeline
│   │   ├── resume.schema.ts      # Canonical JSON schema (Zod)
│   │   ├── resume.types.ts       # TypeScript types
│   │   └── resume.repository.ts  # DB queries (Prisma)
│   │
│   ├── ats/                      # ATS scoring engine
│   │   ├── ats.scorer.ts         # Main scoring orchestrator
│   │   ├── ats.format.ts         # Format analysis
│   │   ├── ats.keywords.ts       # Keyword density scoring
│   │   ├── ats.sections.ts       # Section completeness
│   │   ├── ats.bullets.ts        # Bullet quality analysis
│   │   └── ats.types.ts
│   │
│   ├── match/                    # JD comparison engine
│   │   ├── match.engine.ts       # Matching orchestrator
│   │   ├── match.keywords.ts     # Keyword extraction
│   │   ├── match.similarity.ts   # TF-IDF / cosine similarity
│   │   ├── match.gaps.ts         # Skill gap detection
│   │   └── match.types.ts
│   │
│   ├── ai/                       # AI orchestration
│   │   ├── ai.router.ts          # LLM provider routing
│   │   ├── ai.provider.ts        # Provider interface
│   │   ├── ai.gemini.ts          # Gemini implementation
│   │   ├── ai.groq.ts            # Groq implementation
│   │   ├── ai.prompts/           # Versioned prompt templates
│   │   │   ├── bullet-enhance.v1.ts
│   │   │   ├── resume-tailor.v1.ts
│   │   │   └── extract-skills.v1.ts
│   │   ├── ai.cache.ts           # Response caching
│   │   └── ai.budget.ts          # Token budget management
│   │
│   ├── export/                   # PDF generation
│   │   ├── export.service.ts
│   │   ├── export.templates/     # ATS-friendly PDF templates
│   │   └── export.types.ts
│   │
│   └── analytics/                # Analytics & tracking
│       ├── analytics.service.ts
│       └── analytics.events.ts
│
├── lib/                          # Shared utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── redis.ts                  # Upstash Redis client
│   ├── storage.ts                # R2 storage client
│   ├── queue.ts                  # QStash client
│   ├── cache.ts                  # Multi-layer caching utility
│   ├── rate-limit.ts             # Rate limiter
│   └── utils.ts                  # Common helpers
│
├── components/                   # React components
│   ├── ui/                       # Shadcn/UI primitives
│   ├── resume/                   # Resume-specific components
│   ├── ads/                      # Ad slot components
│   └── layout/                   # Layout components
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
│
└── config/
    ├── env.ts                    # Environment validation (Zod)
    └── constants.ts              # App-wide constants
```

## Extraction Triggers

| Module | Extract When | Extract To |
|--------|-------------|-----------|
| `ai/` | LLM costs > $50/month or latency > 5s p95 | Separate API service (Railway/Fly.io) |
| `export/` | PDF generation blocking API threads | Dedicated worker process |
| `resume.parser` | Parse queue depth > 100 consistently | Dedicated worker with its own scaling |
| All others | Keep in monolith until 50k+ users | N/A |

## Key Design Rules

1. **Modules never import from each other's internals** — only through the module's public `service` file
2. **Each module has its own types file** — no shared types except in `lib/`
3. **API routes are thin** — they validate input, call the module service, return response
4. **All DB access goes through `.repository.ts` files** — never raw Prisma in routes
5. **AI prompts are versioned files** — never hardcoded strings in business logic
