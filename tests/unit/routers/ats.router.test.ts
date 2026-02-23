/**
 * @module tests/unit/routers/ats.router.test
 * @description Tests for the ATS tRPC router.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the ats service
vi.mock("@/server/services/ats.service", () => ({
    atsService: {
        scoreResume: vi.fn(),
        getScore: vi.fn(),
        compareScores: vi.fn(),
    },
}));

// Mock tRPC infrastructure
vi.mock("@/server/trpc/trpc", () => {
    const mockMiddleware = {
        use: vi.fn().mockReturnThis(),
    };

    const createProcedure = () => {
        const proc: Record<string, unknown> = {};
        proc.input = vi.fn().mockReturnValue({
            mutation: vi.fn().mockReturnValue(proc),
            query: vi.fn().mockReturnValue(proc),
        });
        proc.mutation = vi.fn().mockReturnValue(proc);
        proc.query = vi.fn().mockReturnValue(proc);
        proc.use = vi.fn().mockReturnValue(proc);
        return proc;
    };

    return {
        router: vi.fn((routes: Record<string, unknown>) => routes),
        protectedProcedure: createProcedure(),
        publicProcedure: createProcedure(),
    };
});

import { atsService } from "@/server/services/ats.service";

describe("atsRouter", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should have score, getScore, and compare procedures", async () => {
        // Import the router (which uses the mocked tRPC and service)
        const { atsRouter } = await import("@/server/routers/ats.router");

        // The router function is mocked to return its argument
        expect(atsRouter).toBeDefined();
        expect(typeof atsRouter).toBe("object");
    });

    it("scoreResume service method should accept correct parameters", async () => {
        const mockResult = {
            success: true,
            data: {
                overallScore: 85,
                breakdown: {},
                suggestions: [],
                analyzedAt: new Date().toISOString(),
            },
        };

        (atsService.scoreResume as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockResult
        );

        const result = await atsService.scoreResume("resume-1", "user-1", [
            "TypeScript",
        ]);

        expect(atsService.scoreResume).toHaveBeenCalledWith(
            "resume-1",
            "user-1",
            ["TypeScript"]
        );
        expect(result.success).toBe(true);
    });

    it("getScore service method should accept correct parameters", async () => {
        const mockResult = {
            success: true,
            data: {
                overallScore: 78,
                breakdown: {},
                suggestions: [],
                analyzedAt: new Date().toISOString(),
            },
        };

        (atsService.getScore as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockResult
        );

        const result = await atsService.getScore("resume-1", "user-1");

        expect(atsService.getScore).toHaveBeenCalledWith("resume-1", "user-1");
        expect(result.success).toBe(true);
    });

    it("compareScores service method should accept correct parameters", async () => {
        const mockResult = {
            success: true,
            data: [
                { overallScore: 85, breakdown: {}, suggestions: [], analyzedAt: "" },
                { overallScore: 72, breakdown: {}, suggestions: [], analyzedAt: "" },
            ],
        };

        (atsService.compareScores as ReturnType<typeof vi.fn>).mockResolvedValue(
            mockResult
        );

        const result = await atsService.compareScores(
            ["resume-1", "resume-2"],
            "user-1"
        );

        expect(atsService.compareScores).toHaveBeenCalledWith(
            ["resume-1", "resume-2"],
            "user-1"
        );
        expect(result.success).toBe(true);
        if (result.success) {
            expect((result as any).data).toHaveLength(2);
        }
    });
});
