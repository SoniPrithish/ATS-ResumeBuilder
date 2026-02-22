/**
 * @module server/routers/resume.router
 * @description tRPC router for resume CRUD operations.
 * All procedures require authentication.
 */

import { z } from "zod/v4";
import { router, protectedProcedure } from "@/server/trpc/trpc";
import { resumeService } from "@/server/services/resume.service";
import { TRPCError } from "@trpc/server";

/** Zod schema for creating a resume */
const resumeCreateSchema = z.object({
  title: z.string().min(1).max(100),
  contactInfo: z.record(z.string(), z.unknown()).optional(),
  summary: z.string().optional(),
  experience: z.array(z.record(z.string(), z.unknown())).optional(),
  education: z.array(z.record(z.string(), z.unknown())).optional(),
  skills: z.record(z.string(), z.unknown()).optional(),
  projects: z.array(z.record(z.string(), z.unknown())).optional(),
  certifications: z.array(z.record(z.string(), z.unknown())).optional(),
});

/** Zod schema for updating a resume */
const resumeUpdateSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100).optional(),
  status: z.enum(["DRAFT", "COMPLETE", "ARCHIVED"]).optional(),
  contactInfo: z.record(z.string(), z.unknown()).optional(),
  summary: z.string().optional(),
  experience: z.array(z.record(z.string(), z.unknown())).optional(),
  education: z.array(z.record(z.string(), z.unknown())).optional(),
  skills: z.record(z.string(), z.unknown()).optional(),
  projects: z.array(z.record(z.string(), z.unknown())).optional(),
  certifications: z.array(z.record(z.string(), z.unknown())).optional(),
});

/**
 * Resume tRPC router with CRUD procedures.
 */
export const resumeRouter = router({
  /** List user's resumes with pagination */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(50).default(10),
        status: z.enum(["DRAFT", "COMPLETE", "ARCHIVED"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const result = await resumeService.getUserResumes(ctx.session.user.id, {
        page: input.page,
        pageSize: input.pageSize,
        status: input.status,
      });

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),

  /** Get a single resume by ID */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await resumeService.getResume(
        input.id,
        ctx.session.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),

  /** Create a new resume */
  create: protectedProcedure
    .input(resumeCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const result = await resumeService.createResume(
        ctx.session.user.id,
        input
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),

  /** Update an existing resume */
  update: protectedProcedure
    .input(resumeUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const result = await resumeService.updateResume(
        id,
        ctx.session.user.id,
        data
      );

      if (!result.success) {
        throw new TRPCError({
          code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return result.data;
    }),

  /** Soft-delete a resume */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const result = await resumeService.deleteResume(
        input.id,
        ctx.session.user.id
      );

      if (!result.success) {
        throw new TRPCError({
          code: result.code === "NOT_FOUND" ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
          message: result.error,
        });
      }

      return { success: true };
    }),
});
