import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pdf-parse and mammoth at module level
const mockPdfParse = vi.fn();
vi.mock("pdf-parse", () => ({ default: mockPdfParse }));

const mockExtractRawText = vi.fn();
vi.mock("mammoth", () => ({
  default: { extractRawText: mockExtractRawText },
}));

describe("parseResume (orchestrator)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse full pipeline with mock PDF returning valid resume text", async () => {
    const mockText = [
      "John Doe",
      "john@example.com",
      "(555) 123-4567",
      "San Francisco, CA",
      "",
      "Summary",
      "Experienced software engineer",
      "",
      "Experience",
      "Software Engineer at Google",
      "Jan 2020 - Present",
      "- Built APIs serving 1M+ users",
      "- Reduced latency by 40%",
      "",
      "Education",
      "Bachelor of Science in Computer Science",
      "MIT",
      "2016 - 2020",
      "",
      "Skills",
      "Python, Java, TypeScript, React, Docker",
    ].join("\n");

    mockPdfParse.mockResolvedValue({ text: mockText });

    const { parseResume } = await import("@/modules/parser");
    const buffer = Buffer.from("fake-pdf");
    const result = await parseResume(buffer, "pdf");

    expect(result.success).toBe(true);
    expect((result as any).data).not.toBeNull();
    expect((result as any).data!.contactInfo.fullName).toBe("John Doe");
    expect(result.parseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it("should parse full pipeline with DOCX", async () => {
    const mockText = [
      "Jane Smith",
      "jane@example.com",
      "",
      "Experience",
      "PM at Meta",
      "Mar 2021 - Present",
      "- Led product strategy",
      "",
      "Education",
      "M.S. in Business",
      "Stanford",
      "2019 - 2021",
      "",
      "Skills",
      "Leadership, Communication, Agile",
    ].join("\n");

    mockExtractRawText.mockResolvedValue({
      value: mockText,
      messages: [],
    });

    const { parseResume } = await import("@/modules/parser");
    const buffer = Buffer.from("fake-docx");
    const result = await parseResume(buffer, "docx");

    expect(result.success).toBe(true);
    expect((result as any).data).not.toBeNull();
  });

  it("should handle pipeline with no parseable sections (failure)", async () => {
    const mockText =
      "This is just plain text with no section headers. It goes on and on with no real structure whatsoever and is long enough to pass minimum length.";

    mockPdfParse.mockResolvedValue({ text: mockText });

    const { parseResume } = await import("@/modules/parser");
    const buffer = Buffer.from("fake-pdf");
    const result = await parseResume(buffer, "pdf");

    expect(result.success).toBe(false);
    expect((result as any).errors.length).toBeGreaterThan(0);
  });

  it("should handle pipeline with empty buffer (failure)", async () => {
    mockPdfParse.mockResolvedValue({ text: "" });

    const { parseResume } = await import("@/modules/parser");
    const buffer = Buffer.from("");
    const result = await parseResume(buffer, "pdf");

    expect(result.success).toBe(false);
    expect((result as any).errors.length).toBeGreaterThan(0);
  });
});
