import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/webhooks/qstash/route";
import { verifySignature } from "@/server/lib/qstash";
import { resumeService } from "@/server/services/resume.service";
import { storageService } from "@/server/services/storage.service";
import { parseResume } from "@/modules/parser";

vi.mock("@/server/lib/qstash", () => ({
  verifySignature: vi.fn(),
}));

vi.mock("@/server/services/resume.service", () => ({
  resumeService: {
    getResume: vi.fn(),
    updateResume: vi.fn(),
  },
}));

vi.mock("@/server/services/storage.service", () => ({
  storageService: {
    getResumeFile: vi.fn(),
  },
}));

vi.mock("@/modules/parser", () => ({
  parseResume: vi.fn(),
}));

describe("POST /api/webhooks/qstash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 for invalid signature", async () => {
    vi.mocked(verifySignature).mockResolvedValue({ valid: false });

    const res = await POST(new Request("http://localhost/api/webhooks/qstash", { method: "POST" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid JSON body", async () => {
    vi.mocked(verifySignature).mockResolvedValue({ valid: true, body: "{" });

    const res = await POST(new Request("http://localhost/api/webhooks/qstash", { method: "POST" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for unknown job type", async () => {
    vi.mocked(verifySignature).mockResolvedValue({
      valid: true,
      body: JSON.stringify({ type: "UNKNOWN_JOB", data: {} }),
    });

    const res = await POST(new Request("http://localhost/api/webhooks/qstash", { method: "POST" }));
    expect(res.status).toBe(400);
  });

  it("processes PARSE_RESUME successfully", async () => {
    vi.mocked(verifySignature).mockResolvedValue({
      valid: true,
      body: JSON.stringify({
        type: "PARSE_RESUME",
        data: {
          resumeId: "res-1",
          userId: "user-1",
          fileKey: "uploads/res-1.pdf",
          fileType: "pdf",
        },
      }),
    });

    vi.mocked(resumeService.getResume).mockResolvedValue({
      success: false,
      error: "Resume not found",
    });

    vi.mocked(storageService.getResumeFile).mockResolvedValue({
      success: true,
      data: Buffer.from("pdf-content"),
    });

    vi.mocked(parseResume).mockResolvedValue({
      success: true,
      data: {
        contactInfo: { fullName: "John Doe", email: "john@example.com" },
        summary: "Summary",
        experience: [],
        education: [],
        skills: { technical: [], soft: [], tools: [] },
        projects: [],
        certifications: [],
      },
      errors: [],
      warnings: [],
      parseTimeMs: 1,
      rawText: "raw",
    });

    vi.mocked(resumeService.updateResume).mockResolvedValue({
      success: true,
      data: { id: "res-1" },
    });

    const res = await POST(new Request("http://localhost/api/webhooks/qstash", { method: "POST" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, processed: true });
  });
});
