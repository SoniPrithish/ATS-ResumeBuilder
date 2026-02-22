/**
 * @module tests/unit/routers/resume.router.test
 * @description Unit tests for the resume tRPC router.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { resumeRouter } from "@/server/routers/resume.router";
import { resumeService } from "@/server/services/resume.service";
import { TRPCError } from "@trpc/server";

// Mock the resume service
vi.mock("@/server/services/resume.service", () => ({
    resumeService: {
        getUserResumes: vi.fn(),
        getResume: vi.fn(),
        createResume: vi.fn(),
        updateResume: vi.fn(),
        deleteResume: vi.fn(),
    },
}));

describe("resumeRouter", () => {
    const mockCtx = {
        session: { user: { id: "test-user-id" } },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("list", () => {
        it("should return resumes on success", async () => {
            const mockResult = { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0, hasMore: false };
            vi.mocked(resumeService.getUserResumes).mockResolvedValue({
                success: true,
                data: mockResult,
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            const result = await caller.list({ page: 1, pageSize: 10 });

            expect(result).toEqual(mockResult);
            expect(resumeService.getUserResumes).toHaveBeenCalledWith("test-user-id", {
                page: 1,
                pageSize: 10,
                status: undefined,
            });
        });

        it("should throw TRPCError on failure", async () => {
            vi.mocked(resumeService.getUserResumes).mockResolvedValue({
                success: false,
                error: "Failed",
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            await expect(caller.list({ page: 1, pageSize: 10 })).rejects.toThrow(TRPCError);
        });
    });

    describe("getById", () => {
        it("should return resume on success", async () => {
            const mockResume = { id: "resume-1", title: "Test" };
            vi.mocked(resumeService.getResume).mockResolvedValue({
                success: true,
                data: mockResume as any,
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            const result = await caller.getById({ id: "resume-1" });

            expect(result).toEqual(mockResume);
            expect(resumeService.getResume).toHaveBeenCalledWith("resume-1", "test-user-id");
        });

        it("should throw NOT_FOUND on failure", async () => {
            vi.mocked(resumeService.getResume).mockResolvedValue({
                success: false,
                code: "NOT_FOUND",
                error: "Failed",
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            await expect(caller.getById({ id: "resume-1" })).rejects.toThrow(TRPCError);
        });
    });

    describe("create", () => {
        it("should return created resume on success", async () => {
            const mockResume = { id: "resume-1", title: "Test" };
            vi.mocked(resumeService.createResume).mockResolvedValue({
                success: true,
                data: mockResume as any,
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            const result = await caller.create({ title: "Test" });

            expect(result).toEqual(mockResume);
        });

        it("should throw TRPCError on failure", async () => {
            vi.mocked(resumeService.createResume).mockResolvedValue({
                success: false,
                error: "Failed",
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            await expect(caller.create({ title: "Test" })).rejects.toThrow(TRPCError);
        });
    });

    describe("update", () => {
        it("should return updated resume on success", async () => {
            const mockResume = { id: "resume-1", title: "Test Updated" };
            vi.mocked(resumeService.updateResume).mockResolvedValue({
                success: true,
                data: mockResume as any,
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            const result = await caller.update({ id: "resume-1", title: "Test Updated" });

            expect(result).toEqual(mockResume);
        });

        it("should throw TRPCError on failure", async () => {
            vi.mocked(resumeService.updateResume).mockResolvedValue({
                success: false,
                error: "Failed",
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            await expect(caller.update({ id: "resume-1" })).rejects.toThrow(TRPCError);
        });
    });

    describe("delete", () => {
        it("should return success on successful delete", async () => {
            vi.mocked(resumeService.deleteResume).mockResolvedValue({
                success: true,
                data: undefined,
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            const result = await caller.delete({ id: "resume-1" });

            expect(result).toEqual({ success: true });
        });

        it("should throw TRPCError on failure", async () => {
            vi.mocked(resumeService.deleteResume).mockResolvedValue({
                success: false,
                error: "Failed",
            });

            const caller = resumeRouter.createCaller(mockCtx as any);
            await expect(caller.delete({ id: "resume-1" })).rejects.toThrow(TRPCError);
        });
    });
});
