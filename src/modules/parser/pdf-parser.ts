/**
 * @module modules/parser/pdf-parser
 * @description Extracts text from PDF buffers using pdf-parse.
 * Validates file size, content length, and normalizes whitespace.
 */

/** Maximum allowed PDF buffer size: 5MB */
const MAX_PDF_SIZE = 5 * 1024 * 1024;

/** Minimum text length to consider valid */
const MIN_TEXT_LENGTH = 50;

/**
 * Load pdf-parse lazily to allow mocking in tests.
 */
async function loadPdfParse(): Promise<
  (buffer: Buffer, options?: { max?: number }) => Promise<{ text: string }>
> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import("pdf-parse") as any;
  return mod.default ?? mod;
}

/**
 * Extract text content from a PDF buffer.
 *
 * @param buffer - The PDF file as a Buffer
 * @returns The extracted and normalized text
 * @throws Error with code PDF_TOO_LARGE, PDF_EMPTY, or PDF_TOO_SHORT
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (buffer.byteLength > MAX_PDF_SIZE) {
    const error = new Error("PDF file exceeds 5MB size limit");
    (error as Error & { code: string }).code = "PDF_TOO_LARGE";
    throw error;
  }

  const pdfParse = await loadPdfParse();
  const result = await pdfParse(buffer, { max: 10 });
  const raw = result.text ?? "";

  // Strip null bytes and control characters (except newlines and tabs)
  const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize whitespace: trim each line, collapse multiple blank lines
  const normalized = cleaned
    .split("\n")
    .map((line: string) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length === 0) {
    const error = new Error(
      "PDF contains no extractable text (possibly image-based)"
    );
    (error as Error & { code: string }).code = "PDF_EMPTY";
    throw error;
  }

  if (normalized.length < MIN_TEXT_LENGTH) {
    const error = new Error(
      `Extracted text too short (${normalized.length} chars, minimum ${MIN_TEXT_LENGTH})`
    );
    (error as Error & { code: string }).code = "PDF_TOO_SHORT";
    throw error;
  }

  return normalized;
}
