import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma, mockLogger, resetAllMocks } from "../../helpers/mocks";

// Mock pdf-parse and mammoth since resume.service imports the parser
vi.mock("pdf-parse", () => ({ default: vi.fn() }));
vi.mock("mammoth", () => ({
  default: { extractRawText: vi.fn() },
}));

import { resumeService } from "@/server/services/resume.service";

describe("resumeService", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("createResume", () => {
    it("should create a resume successfully", async () => {
      const mockResume = {
        id: "resume-1",
        userId: "user-1",
        title: "My Resume",
        status: "DRAFT",
      };
      mockPrisma.resume.create.mockResolvedValue(mockResume);

      const result = await resumeService.createResume("user-1", {
        title: "My Resume",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect((result as any).data).toEqual(mockResume);
      }
    });

    it("should handle creation failure", async () => {
      mockPrisma.resume.create.mockRejectedValue(new Error("DB error"));

      const result = await resumeService.createResume("user-1", {
        title: "My Resume",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("getResume", () => {
    it("should return resume when found and user matches", async () => {
      const mockResume = {
        id: "resume-1",
        userId: "user-1",
        title: "My Resume",
      };
      mockPrisma.resume.findUnique.mockResolvedValue(mockResume);

      const result = await resumeService.getResume("resume-1", "user-1");

      expect(result.success).toBe(true);
    });

    it("should return error when not found", async () => {
      mockPrisma.resume.findUnique.mockResolvedValue(null);

      const result = await resumeService.getResume("resume-999", "user-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("NOT_FOUND");
      }
    });

    it("should return error when wrong user", async () => {
      const mockResume = {
        id: "resume-1",
        userId: "user-2",
        title: "Other Resume",
      };
      mockPrisma.resume.findUnique.mockResolvedValue(mockResume);

      const result = await resumeService.getResume("resume-1", "user-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe("NOT_FOUND");
      }
    });
  });

  describe("getUserResumes", () => {
    it("should return paginated resumes", async () => {
      const mockResumes = [
        { id: "resume-1", title: "Resume 1" },
        { id: "resume-2", title: "Resume 2" },
      ];
      mockPrisma.resume.findMany.mockResolvedValue(mockResumes);
      mockPrisma.resume.count.mockResolvedValue(2);

      const result = await resumeService.getUserResumes("user-1", {
        page: 1,
        pageSize: 10,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect((result as any).data.items.length).toBe(2);
        expect((result as any).data.total).toBe(2);
        expect((result as any).data.page).toBe(1);
      }
    });
  });

  describe("updateResume", () => {
    it("should update resume successfully", async () => {
      const mockResume = {
        id: "resume-1",
        userId: "user-1",
        title: "Old Title",
      };
      mockPrisma.resume.findUnique.mockResolvedValue(mockResume);
      mockPrisma.resume.update.mockResolvedValue({
        ...mockResume,
        title: "New Title",
      });

      const result = await resumeService.updateResume("resume-1", "user-1", {
        title: "New Title",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("deleteResume", () => {
    it("should soft-delete resume by setting ARCHIVED status", async () => {
      const mockResume = {
        id: "resume-1",
        userId: "user-1",
        status: "DRAFT",
      };
      mockPrisma.resume.findUnique.mockResolvedValue(mockResume);
      mockPrisma.resume.update.mockResolvedValue({
        ...mockResume,
        status: "ARCHIVED",
      });

      const result = await resumeService.deleteResume("resume-1", "user-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.resume.update).toHaveBeenCalledWith({
        where: { id: "resume-1" },
        data: { status: "ARCHIVED" },
      });
    });

    it("should return error when resume not found", async () => {
      mockPrisma.resume.findUnique.mockResolvedValue(null);

      const result = await resumeService.deleteResume("resume-999", "user-1");

      expect(result.success).toBe(false);
    });
  });
});
