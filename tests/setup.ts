import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// ── Mock environment variables ─────────────────────────────
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
vi.stubEnv("NODE_ENV", "test");
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET = "test-auth-secret-at-least-32-characters-long";
process.env.AUTH_URL = "http://localhost:3000";
process.env.AUTH_GITHUB_ID = "test-github-id";
process.env.AUTH_GITHUB_SECRET = "test-github-secret";
process.env.AUTH_GOOGLE_ID = "test-google-id";
process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
process.env.UPSTASH_REDIS_REST_URL = "https://test-redis.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-redis-token";
process.env.QSTASH_URL = "https://qstash.upstash.io";
process.env.QSTASH_TOKEN = "test-qstash-token";
process.env.QSTASH_CURRENT_SIGNING_KEY = "test-signing-key";
process.env.QSTASH_NEXT_SIGNING_KEY = "test-next-signing-key";
process.env.R2_ACCOUNT_ID = "test-account-id";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.R2_BUCKET_NAME = "test-bucket";
process.env.R2_PUBLIC_URL = "https://test.r2.dev";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-google-ai-key";

// ── Suppress console noise in tests ────────────────────────
vi.spyOn(console, "warn").mockImplementation(() => { });
vi.spyOn(console, "error").mockImplementation(() => { });