/**
 * @module modules/parser/section-detector
 * @description Detects resume sections by matching line text against known header patterns.
 * Supports multiple formats: Title Case, UPPERCASE, with colons, dashes, etc.
 */

import type { ResumeSection, DetectedSection } from "./types";

/** Known header patterns for each section type */
const SECTION_PATTERNS: Record<ResumeSection, RegExp[]> = {
  summary: [
    /^(professional\s+)?summary$/i,
    /^(career\s+)?objective$/i,
    /^about(\s+me)?$/i,
    /^profile$/i,
    /^overview$/i,
  ],
  experience: [
    /^(work\s+|professional\s+)?experience$/i,
    /^employment(\s+history)?$/i,
    /^work\s+history$/i,
    /^career\s+history$/i,
  ],
  education: [
    /^education(al)?(\s+background)?$/i,
    /^academic(\s+background)?$/i,
    /^academic\s+qualifications?$/i,
  ],
  skills: [
    /^(technical\s+|core\s+|key\s+|relevant\s+)?skills$/i,
    /^competenc(ies|es)$/i,
    /^technologies$/i,
    /^tech(nical)?\s+stack$/i,
    /^areas?\s+of\s+expertise$/i,
  ],
  projects: [
    /^(personal\s+|academic\s+|key\s+|selected\s+)?projects$/i,
    /^portfolio$/i,
  ],
  certifications: [
    /^certifications?(\s+[&]?\s*licens(es|ure))?$/i,
    /^licens(es|ure)(\s+[&]?\s*certifications?)?$/i,
    /^professional\s+development$/i,
    /^awards?(\s+[&]?\s*certifications?)?$/i,
  ],
  contact: [],
  unknown: [],
};

/** Characters to strip from a line before matching section headers */
const STRIP_CHARS = /[:\-–—|_#*=]/g;

/**
 * Detect sections in raw resume text by matching lines against known header patterns.
 *
 * @param text - The raw resume text
 * @returns Array of detected sections with their positions and content
 */
export function detectSections(text: string): DetectedSection[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const lines = text.split("\n");
  const sections: DetectedSection[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Reject lines longer than 50 chars as headers
    if (line.trim().length > 50) continue;

    // Clean the line for matching
    const cleaned = line.replace(STRIP_CHARS, "").trim();
    if (cleaned.length === 0) continue;

    const sectionType = matchSectionType(cleaned);
    if (sectionType) {
      // Close the previous section
      if (sections.length > 0) {
        const prev = sections[sections.length - 1];
        prev.endIndex = i - 1;
        prev.rawContent = lines.slice(prev.startIndex + 1, i).join("\n").trim();
      }

      sections.push({
        type: sectionType,
        startIndex: i,
        endIndex: lines.length - 1, // will be updated when next section found
        rawContent: "", // will be filled when section closes
        headerText: line.trim(),
      });
    }
  }

  // Close the last section
  if (sections.length > 0) {
    const last = sections[sections.length - 1];
    last.endIndex = lines.length - 1;
    last.rawContent = lines
      .slice(last.startIndex + 1, lines.length)
      .join("\n")
      .trim();
  }

  return sections;
}

/**
 * Match a cleaned line against all section patterns.
 *
 * @param cleaned - The cleaned line text
 * @returns The matching section type, or null if no match
 */
function matchSectionType(cleaned: string): ResumeSection | null {
  for (const [section, patterns] of Object.entries(SECTION_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(cleaned)) {
        return section as ResumeSection;
      }
    }
  }
  return null;
}
