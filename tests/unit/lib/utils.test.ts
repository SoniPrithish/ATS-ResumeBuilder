/**
 * @module tests/unit/lib/utils.test
 * @description Unit tests for utility functions.
 */

import { describe, it, expect } from "vitest";
import {
    cn,
    formatDate,
    formatRelativeDate,
    truncate,
    slugify,
    formatFileSize,
    sleep,
} from "@/lib/utils";

describe("cn()", () => {
    it("merges class names", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
        expect(cn("base", false && "hidden", "visible")).toBe("base visible");
    });

    it("resolves Tailwind conflicts (last wins)", () => {
        const result = cn("p-4", "p-2");
        expect(result).toBe("p-2");
    });

    it("handles empty inputs", () => {
        expect(cn()).toBe("");
    });

    it("handles undefined and null", () => {
        expect(cn("a", undefined, null, "b")).toBe("a b");
    });
});

describe("formatDate()", () => {
    it("formats a Date object with default format", () => {
        const date = new Date("2024-03-15T12:00:00Z");
        const result = formatDate(date);
        expect(result).toMatch(/Mar 15, 2024/);
    });

    it("formats a date string", () => {
        const result = formatDate("2024-12-25T12:00:00Z");
        expect(result).toMatch(/Dec 25, 2024/);
    });

    it("supports custom format strings", () => {
        const result = formatDate("2024-01-15T12:00:00Z", "yyyy/MM/dd");
        expect(result).toBe("2024/01/15");
    });
});

describe("formatRelativeDate()", () => {
    it("returns a relative time string", () => {
        const recent = new Date(Date.now() - 60 * 1000); // 1 minute ago
        const result = formatRelativeDate(recent);
        expect(result).toContain("ago");
    });

    it("handles date strings", () => {
        const result = formatRelativeDate("2020-01-01");
        expect(result).toContain("ago");
    });
});

describe("truncate()", () => {
    it("returns short strings unchanged", () => {
        expect(truncate("hello", 10)).toBe("hello");
    });

    it("truncates long strings with ellipsis", () => {
        const result = truncate("This is a very long string that should be truncated", 20);
        expect(result.length).toBeLessThanOrEqual(21); // 20 + ellipsis char
        expect(result).toContain("…");
    });

    it("uses default max length of 100", () => {
        const long = "a".repeat(150);
        const result = truncate(long);
        expect(result.length).toBeLessThanOrEqual(101);
    });

    it("handles exact boundary length", () => {
        expect(truncate("12345", 5)).toBe("12345");
    });

    it("handles empty string", () => {
        expect(truncate("")).toBe("");
    });
});

describe("slugify()", () => {
    it("converts to lowercase", () => {
        expect(slugify("Hello World")).toBe("hello-world");
    });

    it("replaces spaces with hyphens", () => {
        expect(slugify("my resume title")).toBe("my-resume-title");
    });

    it("removes special characters", () => {
        expect(slugify("Hello, World!")).toBe("hello-world");
    });

    it("collapses multiple hyphens", () => {
        expect(slugify("hello---world")).toBe("hello-world");
    });

    it("trims leading/trailing hyphens", () => {
        expect(slugify("--hello--")).toBe("hello");
    });

    it("handles empty string", () => {
        expect(slugify("")).toBe("");
    });

    it("handles underscores", () => {
        expect(slugify("hello_world")).toBe("hello-world");
    });
});

describe("formatFileSize()", () => {
    it("formats bytes", () => {
        expect(formatFileSize(500)).toBe("500 B");
    });

    it("formats kilobytes", () => {
        expect(formatFileSize(1024)).toBe("1 KB");
    });

    it("formats megabytes", () => {
        expect(formatFileSize(1024 * 1024)).toBe("1 MB");
    });

    it("formats with decimal", () => {
        expect(formatFileSize(1536 * 1024)).toBe("1.5 MB");
    });

    it("handles zero", () => {
        expect(formatFileSize(0)).toBe("0 B");
    });
});

describe("sleep()", () => {
    it("resolves after the specified duration", async () => {
        const start = Date.now();
        await sleep(50);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(40);
    });
});
