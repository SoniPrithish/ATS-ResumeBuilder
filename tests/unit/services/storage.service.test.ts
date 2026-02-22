import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockR2, resetAllMocks } from "../../helpers/mocks";

import { storageService } from "@/server/services/storage.service";

describe("storageService", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("uploadResume", () => {
    it("should upload successfully with valid params", async () => {
      mockR2.uploadFile.mockResolvedValue({
        success: true,
        data: {
          key: "uploads/test.pdf",
          url: "https://test.r2.dev/uploads/test.pdf",
          fileName: "resume.pdf",
          fileType: "application/pdf",
          fileSize: 1024,
        },
      });

      const result = await storageService.uploadResume(
        "user-1",
        "resume-1",
        "resume.pdf",
        Buffer.from("pdf-content"),
        "application/pdf"
      );

      expect(result.success).toBe(true);
    });

    it("should reject file too large", async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024);

      const result = await storageService.uploadResume(
        "user-1",
        "resume-1",
        "resume.pdf",
        largeBuffer,
        "application/pdf"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("5MB");
      }
    });

    it("should reject invalid content type", async () => {
      const result = await storageService.uploadResume(
        "user-1",
        "resume-1",
        "resume.txt",
        Buffer.from("text"),
        "text/plain"
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("Invalid content type");
      }
    });
  });

  describe("getResumeFile", () => {
    it("should return file data on success", async () => {
      mockR2.getFileUrl.mockReturnValue("https://test.r2.dev/file.pdf");

      const result = await storageService.getResumeFile("uploads/test.pdf");

      expect(result.success).toBe(true);
    });
  });

  describe("deleteResumeFile", () => {
    it("should delete file successfully", async () => {
      mockR2.deleteFile.mockResolvedValue({ success: true, data: { key: "test" } });

      const result = await storageService.deleteResumeFile("uploads/test.pdf");

      expect(result.success).toBe(true);
    });
  });
});
