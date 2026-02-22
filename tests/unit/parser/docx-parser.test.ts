import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("mammoth", () => ({
  default: {
    extractRawText: vi.fn(),
  },
}));

import mammoth from "mammoth";
import { extractTextFromDocx } from "@/modules/parser/docx-parser";

describe("extractTextFromDocx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should extract text from valid DOCX buffer", async () => {
    const mockText =
      "Jane Doe\njane@example.com\n\nExperience\nProduct Manager at Meta\nMar 2019 - Present";

    vi.mocked(mammoth.extractRawText).mockResolvedValue({
      value: mockText,
      messages: [],
    });

    const buffer = Buffer.from("fake-docx-content");
    const result = await extractTextFromDocx(buffer);

    expect(result).toContain("Jane Doe");
    expect(result).toContain("Product Manager at Meta");
  });

  it("should throw DOCX_EMPTY for empty DOCX", async () => {
    vi.mocked(mammoth.extractRawText).mockResolvedValue({
      value: "",
      messages: [],
    });

    const buffer = Buffer.from("fake-docx");

    await expect(extractTextFromDocx(buffer)).rejects.toThrow();
    try {
      await extractTextFromDocx(buffer);
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("DOCX_EMPTY");
    }
  });

  it("should throw DOCX_CORRUPT for corrupt buffer", async () => {
    vi.mocked(mammoth.extractRawText).mockRejectedValue(
      new Error("Invalid DOCX")
    );

    const buffer = Buffer.from("corrupt-data");

    await expect(extractTextFromDocx(buffer)).rejects.toThrow();
    try {
      await extractTextFromDocx(buffer);
    } catch (err) {
      expect((err as Error & { code: string }).code).toBe("DOCX_CORRUPT");
    }
  });
});
