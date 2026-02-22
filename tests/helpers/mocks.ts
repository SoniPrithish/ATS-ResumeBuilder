/**
 * @module tests/helpers/mocks
 * @description Common mocks for external services used across tests.
 * Import these in your test files to mock Prisma, Redis, R2, and AI providers.
 */

import { vi } from "vitest";

// ── Prisma Client Mock ─────────────────────────────────────
export const mockPrisma = {
    user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    resume: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    resumeVersion: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        count: vi.fn(),
    },
    jobDescription: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
    },
    matchResult: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
    },
    aiGeneration: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
    analyticsEvent: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
    },
    account: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
    session: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
    },
    $transaction: vi.fn((fn: unknown) =>
        typeof fn === "function" ? fn(mockPrisma) : fn
    ),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
};

vi.mock("@/server/lib/db", () => ({
    db: mockPrisma,
}));

// ── Redis Mock ─────────────────────────────────────────────
export const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    expire: vi.fn(),
    pipeline: vi.fn(() => ({
        get: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        del: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([]),
    })),
};

export const mockCacheHelpers = {
    getCache: vi.fn(),
    setCache: vi.fn(),
    invalidateCache: vi.fn(),
};

vi.mock("@/server/lib/redis", () => ({
    redis: mockRedis,
    getCache: mockCacheHelpers.getCache,
    setCache: mockCacheHelpers.setCache,
    invalidateCache: mockCacheHelpers.invalidateCache,
}));

// ── R2 Storage Mock ────────────────────────────────────────
export const mockR2 = {
    uploadFile: vi.fn().mockResolvedValue({
        success: true,
        data: {
            key: "uploads/test-file.pdf",
            url: "https://test.r2.dev/uploads/test-file.pdf",
        },
    }),
    getFileUrl: vi.fn().mockReturnValue("https://test.r2.dev/uploads/test-file.pdf"),
    deleteFile: vi.fn().mockResolvedValue({ success: true }),
};

vi.mock("@/server/lib/r2", () => mockR2);

// ── QStash Mock ────────────────────────────────────────────
export const mockQStash = {
    publishJob: vi.fn().mockResolvedValue({ messageId: "msg-test-123" }),
    verifySignature: vi.fn().mockResolvedValue(true),
};

vi.mock("@/server/lib/qstash", () => mockQStash);

// ── AI Provider Mock ───────────────────────────────────────
export const mockAIProvider = {
    generateText: vi.fn().mockResolvedValue({
        text: "Mock AI response",
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    }),
    generateObject: vi.fn().mockResolvedValue({
        object: {},
        usage: { promptTokens: 100, completionTokens: 50, totalTokens: 150 },
    }),
};

// ── Logger Mock ────────────────────────────────────────────
export const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(() => mockLogger),
};

vi.mock("@/server/lib/logger", () => ({
    logger: mockLogger,
    createChildLogger: vi.fn(() => mockLogger),
}));

/**
 * Reset all mocks between tests.
 * Call this in a beforeEach() block.
 */
export function resetAllMocks(): void {
    vi.clearAllMocks();
}
