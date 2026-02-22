/**
 * @module tests/unit/auth/config.test
 * @description Unit tests for NextAuth configuration structure.
 */

import { describe, it, expect, vi } from "vitest";

// Mock the db module before importing auth config
vi.mock("@/server/lib/db", () => ({
    db: {},
}));

// Mock next-auth to avoid runtime initialization
vi.mock("next-auth", () => ({
    default: vi.fn((config: Record<string, unknown>) => ({
        handlers: { GET: vi.fn(), POST: vi.fn() },
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        _config: config,
    })),
}));

// Mock the adapter
vi.mock("@auth/prisma-adapter", () => ({
    PrismaAdapter: vi.fn(() => ({})),
}));

describe("Auth Providers", () => {
    it("should export providers array", async () => {
        const { providers } = await import("@/server/auth/providers");
        expect(providers).toBeDefined();
        expect(Array.isArray(providers)).toBe(true);
        expect(providers.length).toBe(2);
    });
});

describe("Auth Callbacks", () => {
    it("sessionCallback injects user.id into session", async () => {
        const { sessionCallback } = await import("@/server/auth/callbacks");

        const session = {
            user: { name: "Test", email: "test@test.com" },
            expires: new Date().toISOString(),
        };
        const user = { id: "user-123" };

        const result = sessionCallback({
            session: session as never,
            user: user as never,
        });

        expect(result.user?.id).toBe("user-123");
    });

    it("sessionCallback handles missing user gracefully", async () => {
        const { sessionCallback } = await import("@/server/auth/callbacks");

        const session = {
            user: { name: "Test" },
            expires: new Date().toISOString(),
        };

        const result = sessionCallback({
            session: session as never,
            user: {} as never,
        });

        expect(result).toBeDefined();
    });

    it("signInCallback allows all sign-ins", async () => {
        const { signInCallback } = await import("@/server/auth/callbacks");
        expect(signInCallback()).toBe(true);
    });
});
