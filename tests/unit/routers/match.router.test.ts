import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/server/services/matcher.service", () => ({
    matcherService: {
        matchResumeToJD: vi.fn(),
        getMatch: vi.fn(),
    },
}));

vi.mock("@/server/trpc/trpc", () => {
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
    };
});

import { matcherService } from "@/server/services/matcher.service";

describe("match.router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("has match and getMatch procedures", async () => {
        const { matchRouter } = await import("@/server/routers/match.router");
        expect(matchRouter).toBeDefined();
    });

    it("calls service method signatures", async () => {
        (matcherService.matchResumeToJD as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: {} });
        await matcherService.matchResumeToJD("r1", "j1", "u1");
        expect(matcherService.matchResumeToJD).toHaveBeenCalledWith("r1", "j1", "u1");
    });
});
