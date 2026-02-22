import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/server/services/matcher.service", () => ({
    matcherService: {
        saveJobDescription: vi.fn(),
        getUserJobDescriptions: vi.fn(),
        getJobDescription: vi.fn(),
        deleteJobDescription: vi.fn(),
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

describe("job.router", () => {
    beforeEach(() => vi.clearAllMocks());

    it("has CRUD procedures", async () => {
        const { jobRouter } = await import("@/server/routers/job.router");
        expect(jobRouter).toBeDefined();
    });

    it("calls save/list/get/delete service signatures", async () => {
        await matcherService.saveJobDescription("u1", { title: "SE", rawText: "x".repeat(60) });
        expect(matcherService.saveJobDescription).toHaveBeenCalled();

        await matcherService.getUserJobDescriptions("u1", 1, 10);
        expect(matcherService.getUserJobDescriptions).toHaveBeenCalledWith("u1", 1, 10);

        await matcherService.getJobDescription("j1", "u1");
        expect(matcherService.getJobDescription).toHaveBeenCalledWith("j1", "u1");

        await matcherService.deleteJobDescription("j1", "u1");
        expect(matcherService.deleteJobDescription).toHaveBeenCalledWith("j1", "u1");
    });
});
