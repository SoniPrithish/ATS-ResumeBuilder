/**
 * @module tests/unit/ats/bullet-scorer.test
 * @description Tests for the ATS bullet quality scorer.
 */

import { describe, it, expect } from "vitest";
import { scoreBullets } from "@/modules/ats/bullet-scorer";
import type { BulletInput } from "@/modules/ats/types";

describe("scoreBullets", () => {
    it("should score strong bullets highly", () => {
        const input: BulletInput = {
            bullets: [
                "Reduced API latency by 40% by implementing Redis caching across 12 microservices, handling 50K requests per second",
                "Led a team of 8 engineers to deliver a real-time analytics dashboard serving 100K daily active users",
                "Designed and implemented a CI/CD pipeline that reduced deployment time from 2 hours to 15 minutes using GitHub Actions",
                "Optimized database queries reducing average response time by 60% across 3 production services",
                "Architected a microservices migration strategy that improved system reliability to 99.99% uptime",
            ],
        };

        const result = scoreBullets(input);
        expect(result.score).toBeGreaterThanOrEqual(70);
        expect(result.category).toBe("bullets");
        expect(result.maxScore).toBe(100);
    });

    it("should score weak bullets poorly", () => {
        const input: BulletInput = {
            bullets: [
                "Helped with various tasks",
                "Responsible for doing things",
                "Worked on projects",
                "Assisted team",
                "Was part of the dev team",
            ],
        };

        const result = scoreBullets(input);
        expect(result.score).toBeLessThanOrEqual(40);
        expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should score mixed quality at mid range", () => {
        const input: BulletInput = {
            bullets: [
                "Developed a REST API serving 10K users with Node.js and Express",
                "Helped with frontend development",
                "Implemented automated testing reducing bugs by 30% across the release cycle",
                "Worked on database optimization tasks",
                "Created monitoring dashboards using Grafana tracking 50+ metrics in real-time production",
            ],
        };

        const result = scoreBullets(input);
        expect(result.score).toBeGreaterThanOrEqual(40);
        expect(result.score).toBeLessThanOrEqual(80);
    });

    it("should return score 0 for no bullets", () => {
        const input: BulletInput = {
            bullets: [],
        };

        const result = scoreBullets(input);
        expect(result.score).toBe(0);
        expect(result.suggestions.some((s) => s.includes("No bullet points"))).toBe(
            true
        );
    });

    it("should give length penalty for very long bullets", () => {
        const longBullet =
            "Developed " +
            Array.from({ length: 50 }, () => "word").join(" ") +
            " with quantified result of 50% improvement across multiple services";

        const normalBullet =
            "Developed a microservices architecture serving 1M users with 99.9% uptime using TypeScript and Node.js";

        const longResult = scoreBullets({ bullets: [longBullet] });
        const normalResult = scoreBullets({ bullets: [normalBullet] });

        // Normal should score better than overly long
        expect(normalResult.score).toBeGreaterThanOrEqual(longResult.score);
    });

    it("should give quantification bonus for numbers/metrics", () => {
        const withMetrics: BulletInput = {
            bullets: [
                "Reduced deployment time by 75% through automation and improved build pipeline efficiency",
                "Increased test coverage from 45% to 92% across a codebase of 100K lines",
            ],
        };

        const withoutMetrics: BulletInput = {
            bullets: [
                "Improved deployment time through automation and improved build pipeline efficiency across teams",
                "Increased test coverage across a large codebase through comprehensive unit and integration testing",
            ],
        };

        const scoreWith = scoreBullets(withMetrics);
        const scoreWithout = scoreBullets(withoutMetrics);

        expect(scoreWith.score).toBeGreaterThan(scoreWithout.score);
    });

    it("should detect action verb usage", () => {
        const withAction: BulletInput = {
            bullets: [
                "Implemented a caching strategy that reduced API response times by 40% across production services",
            ],
        };

        const withoutAction: BulletInput = {
            bullets: [
                "Was involved in implementing a caching strategy that reduced API response times by 40% across production services",
            ],
        };

        const scoreWith = scoreBullets(withAction);
        const scoreWithout = scoreBullets(withoutAction);

        expect(scoreWith.score).toBeGreaterThanOrEqual(scoreWithout.score);
    });
});
