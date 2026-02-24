import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/upload/route";
import { auth } from "@/server/auth/config";
import { resumeService } from "@/server/services/resume.service";

vi.mock("@/server/auth/config", () => ({
  auth: vi.fn(),
}));

vi.mock("@/server/services/resume.service", () => ({
  resumeService: {
    uploadAndParseResume: vi.fn(),
  },
}));

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createRequestWithFile(file?: File) {
    const req = new Request("http://localhost/api/upload", {
      method: "POST",
    });
    req.formData = async () => {
      const fd = new FormData();
      if (file) fd.append("file", file);
      return fd;
    };
    return req;
  }

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const req = createRequestWithFile();
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, error: "Unauthorized" });
  });

  it("returns 400 when file is missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
    const req = createRequestWithFile();
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: "No file provided" });
  });

  it("returns 400 for invalid file type", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
    const file = new File(["hello"], "resume.txt", { type: "text/plain" });
    const req = createRequestWithFile(file);
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("Invalid file type");
  });

  it("returns 200 when upload succeeds", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(resumeService.uploadAndParseResume).mockResolvedValue({
      success: true,
      data: { id: "resume-1" },
    });

    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    const req = createRequestWithFile(file);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, resumeId: "resume-1" });
  });
});
