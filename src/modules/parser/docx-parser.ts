/**
 * @module modules/parser/docx-parser
 * @description Extracts text from DOCX buffers using mammoth.
 * Validates content and normalizes whitespace.
 */

import mammoth from "mammoth";

/**
 * Extract text content from a DOCX buffer.
 *
 * @param buffer - The DOCX file as a Buffer
 * @returns The extracted and normalized text
 * @throws Error with code DOCX_EMPTY or DOCX_CORRUPT
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  let result;
  try {
    result = await mammoth.extractRawText({ buffer });
  } catch {
    const error = new Error("Failed to read DOCX file (possibly corrupt)");
    (error as Error & { code: string }).code = "DOCX_CORRUPT";
    throw error;
  }

  const raw = result.value ?? "";

  // Strip null bytes and control characters (except newlines and tabs)
  const cleaned = raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Normalize whitespace: trim each line, collapse multiple blank lines
  const normalized = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (normalized.length === 0) {
    const error = new Error("DOCX contains no extractable text");
    (error as Error & { code: string }).code = "DOCX_EMPTY";
    throw error;
  }

  return normalized;
}
