import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock pdf-parse at module level
const mockPdfParse = vi.fn();
vi.mock("pdf-parse", () => ({ default: mockPdfParse }));

describe("extractTextFromPdf", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("should extract text from valid PDF buffer", async () => {
    const mockText =
      "John Doe\njohn@example.com\n\nExperience\nSoftware Engineer at Google\nJan 2020 - Present\n- Built APIs";

    mockPdfParse.mockResolvedValue({ text: mockText });

    const { extractTextFromPdf } = await import(
      "@/modules/parser/pdf-parser"
    );
    const buffer = Buffer.from("fake-pdf-content");
    const result = await extractTextFromPdf(buffer);

    expect(result).toContain("John Doe");
    expect(result).toContain("Software Engineer at Google");
  });

  it("should throw PDF_EMPTY for empty PDF", async () => {
    mockPdfParse.mockResolvedValue({ text: "" });

    const { extractTextFromPdf } = await import(
      "@/modules/parser/pdf-parser"
    );
    const buffer = Buffer.from("fake-pdf");

    try {
      await extractTextFromPdf(buffer);
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("PDF_EMPTY");
    }
  });

  it("should throw PDF_EMPTY for image-based PDF (whitespace only)", async () => {
    mockPdfParse.mockResolvedValue({ text: "   \n\n  \t  \n  " });

    const { extractTextFromPdf } = await import(
      "@/modules/parser/pdf-parser"
    );
    const buffer = Buffer.from("fake-pdf");

    try {
      await extractTextFromPdf(buffer);
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("PDF_EMPTY");
    }
  });

  it("should throw PDF_TOO_SHORT for very short text", async () => {
    mockPdfParse.mockResolvedValue({ text: "Short text here" });

    const { extractTextFromPdf } = await import(
      "@/modules/parser/pdf-parser"
    );
    const buffer = Buffer.from("fake-pdf");

    try {
      await extractTextFromPdf(buffer);
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("PDF_TOO_SHORT");
    }
  });

  it("should throw PDF_TOO_LARGE for oversized buffer", async () => {
    const { extractTextFromPdf } = await import(
      "@/modules/parser/pdf-parser"
    );
    const buffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

    try {
      await extractTextFromPdf(buffer);
      expect.fail("Should have thrown");
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("PDF_TOO_LARGE");
    }
  });
});
