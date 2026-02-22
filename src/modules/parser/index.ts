/**
 * @module modules/parser
 * @description Parser orchestrator that coordinates the full resume parsing pipeline.
 * Extracts text from PDF/DOCX, detects sections, and parses each section
 * using specialized parsers.
 */

import { extractTextFromPdf } from "./pdf-parser";
import { extractTextFromDocx } from "./docx-parser";
import { detectSections } from "./section-detector";
import { extractContact } from "./contact-extractor";
import { parseExperience } from "./experience-parser";
import { parseEducation } from "./education-parser";
import { extractSkills } from "./skills-extractor";
import { parseProjects } from "./projects-parser";
import { parseCertifications } from "./certifications-parser";
import { isLinkedInFormat, parseLinkedInPdf } from "./linkedin-pdf-parser";
import type { ParseResult, CanonicalResume } from "./types";

/**
 * Parse a resume buffer into a CanonicalResume structure.
 *
 * Full pipeline:
 * 1. Validate file type
 * 2. Extract raw text via pdf-parser or docx-parser
 * 3. Detect if LinkedIn format → use linkedin-pdf-parser
 * 4. Otherwise: extract contact, detect sections, parse each section
 * 5. Assemble CanonicalResume
 * 6. Measure total parseTimeMs
 * 7. Return ParseResult with success/errors/warnings
 *
 * @param buffer - The file buffer
 * @param fileType - The file type ('pdf' or 'docx')
 * @returns ParseResult with parsed data, errors, and warnings
 */
export async function parseResume(
  buffer: Buffer,
  fileType: "pdf" | "docx"
): Promise<ParseResult> {
  const startTime = performance.now();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Step 1: Validate file type
  if (fileType !== "pdf" && fileType !== "docx") {
    return {
      success: false,
      data: null,
      errors: [`Unsupported file type: ${fileType}`],
      warnings: [],
      parseTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // Step 2: Extract raw text
  let rawText: string;
  try {
    rawText =
      fileType === "pdf"
        ? await extractTextFromPdf(buffer)
        : await extractTextFromDocx(buffer);
  } catch (err) {
    const error = err as Error & { code?: string };
    return {
      success: false,
      data: null,
      errors: [`Text extraction failed: ${error.code ?? error.message}`],
      warnings: [],
      parseTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // Step 3: Detect if LinkedIn format
  if (isLinkedInFormat(rawText)) {
    try {
      const data = parseLinkedInPdf(rawText);
      return {
        success: true,
        data,
        errors: [],
        warnings: ["Detected LinkedIn PDF format"],
        parseTimeMs: Math.round(performance.now() - startTime),
      };
    } catch (err) {
      warnings.push(
        `LinkedIn parser failed, falling back to standard parser: ${(err as Error).message}`
      );
    }
  }

  // Step 4: Standard parsing pipeline
  // 4a: Extract contact info
  let contactInfo = {
    fullName: "",
    email: "",
  };
  try {
    contactInfo = extractContact(rawText);
  } catch (err) {
    errors.push(`Contact extraction failed: ${(err as Error).message}`);
  }

  // 4b: Detect sections
  const sections = detectSections(rawText);

  if (sections.length === 0) {
    return {
      success: false,
      data: null,
      errors: ["No parseable sections detected in the resume"],
      warnings,
      parseTimeMs: Math.round(performance.now() - startTime),
    };
  }

  // 4c: Parse each section
  const resume: CanonicalResume = {
    contactInfo,
    experience: [],
    education: [],
    skills: { technical: [], soft: [], tools: [] },
  };

  const detectedTypes = new Set(sections.map((s) => s.type));

  for (const section of sections) {
    try {
      switch (section.type) {
        case "summary":
          resume.summary = section.rawContent;
          break;
        case "experience":
          resume.experience = parseExperience(section.rawContent);
          break;
        case "education":
          resume.education = parseEducation(section.rawContent);
          break;
        case "skills":
          resume.skills = extractSkills(section.rawContent);
          break;
        case "projects":
          resume.projects = parseProjects(section.rawContent);
          break;
        case "certifications":
          resume.certifications = parseCertifications(section.rawContent);
          break;
        default:
          break;
      }
    } catch (err) {
      errors.push(
        `Failed to parse ${section.type} section: ${(err as Error).message}`
      );
    }
  }

  // 4d: Add warnings for missing sections
  const expectedSections = [
    "experience",
    "education",
    "skills",
  ] as const;
  for (const expected of expectedSections) {
    if (!detectedTypes.has(expected)) {
      warnings.push(`No "${expected}" section detected`);
    }
  }

  return {
    success: errors.length === 0,
    data: resume,
    errors,
    warnings,
    parseTimeMs: Math.round(performance.now() - startTime),
  };
}
