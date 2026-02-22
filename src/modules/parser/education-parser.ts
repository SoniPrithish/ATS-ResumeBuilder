/**
 * @module modules/parser/education-parser
 * @description Parses education sections from resume text.
 * Detects degrees, institutions, fields of study, GPA, and coursework.
 */

import { nanoid } from "nanoid";
import type { EducationEntry } from "./types";

/** Degree patterns */
const DEGREE_PATTERNS = [
  /\b(Bachelor(?:\s+of)?\s+(?:Science|Arts|Engineering|Technology))\b/i,
  /\b(Master(?:\s+of)?\s+(?:Science|Arts|Engineering|Technology|Business\s+Administration))\b/i,
  /\b(Doctor(?:ate)?\s+of\s+Philosophy|Ph\.?D\.?)\b/i,
  /\b(Associate(?:\s+of)?\s+(?:Science|Arts|Applied\s+Science))\b/i,
  /\b(B\.?S\.?|B\.?A\.?|B\.?Tech\.?|B\.?E\.?)\b/,
  /\b(M\.?S\.?|M\.?A\.?|M\.?Tech\.?|M\.?B\.?A\.?|M\.?E\.?)\b/,
  /\b(Ph\.?D\.?)\b/i,
];

/** GPA patterns */
const GPA_RE =
  /(?:(?:C?GPA|Grade)[:\s]*)?(\d+\.\d+)\s*(?:\/\s*(\d+\.?\d*))?(?:\s*GPA)?/i;

/** Year pattern */
const YEAR_RE = /\b(20\d{2}|19\d{2})\b/;

/** Date range in education */
const EDU_DATE_RE =
  /(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4}))\s*[-–—]\s*(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?(\d{4})|[Pp]resent|[Ee]xpected)/;

/** Coursework header */
const COURSEWORK_RE = /^(?:relevant\s+)?coursework[:\s]/i;

/** Field of study after "in" */
const FIELD_RE = /\bin\s+([A-Z][a-zA-Z\s&]+?)(?:\s*[,.(]|$)/;

/**
 * Parse education entries from a section's text.
 *
 * @param sectionText - The raw text of the education section
 * @returns Array of parsed education entries
 */
export function parseEducation(sectionText: string): EducationEntry[] {
  if (!sectionText || sectionText.trim().length === 0) {
    return [];
  }

  const lines = sectionText.split("\n");
  const entries: EducationEntry[] = [];
  let currentEntry: Partial<EducationEntry> | null = null;
  let currentCoursework: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    // Check for coursework
    if (COURSEWORK_RE.test(line)) {
      const courseworkStr = line.replace(COURSEWORK_RE, "").trim();
      if (courseworkStr) {
        currentCoursework = courseworkStr
          .split(/[,;]/)
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      }
      continue;
    }

    // Check for degree
    const degree = extractDegree(line);
    if (degree) {
      // Save previous entry
      if (currentEntry && (currentEntry.institution || currentEntry.degree)) {
        if (currentCoursework.length > 0) {
          currentEntry.coursework = currentCoursework;
        }
        saveEntry(entries, currentEntry);
        currentCoursework = [];
      }

      currentEntry = { degree };

      // Extract field of study
      const fieldMatch = line.match(FIELD_RE);
      if (fieldMatch) {
        currentEntry.field = fieldMatch[1].trim();
      }

      // Check for GPA on same line
      const gpa = extractGPA(line);
      if (gpa) {
        currentEntry.gpa = gpa;
      }

      // Check for dates on same line
      const dates = extractDates(line);
      if (dates) {
        currentEntry.startDate = dates.start;
        currentEntry.endDate = dates.end;
      }

      continue;
    }

    // Check for GPA line
    const gpa = extractGPA(line);
    if (gpa && currentEntry) {
      currentEntry.gpa = gpa;
      continue;
    }

    // Check for dates
    const dates = extractDates(line);
    if (dates && currentEntry) {
      currentEntry.startDate = dates.start;
      currentEntry.endDate = dates.end;
      continue;
    }

    // Check for year only
    const yearMatch = line.match(YEAR_RE);

    // Institution line: if we have a current entry without institution
    if (currentEntry && !currentEntry.institution && line.length < 100) {
      currentEntry.institution = line.replace(GPA_RE, "").trim();
      if (yearMatch && !currentEntry.endDate) {
        currentEntry.endDate = yearMatch[1];
      }
      continue;
    }

    // Start of new entry (institution line before degree)
    if (!currentEntry && line.length < 100) {
      currentEntry = { institution: line };
      if (yearMatch) {
        currentEntry.endDate = yearMatch[1];
      }
      continue;
    }
  }

  // Save last entry
  if (currentEntry && (currentEntry.institution || currentEntry.degree)) {
    if (currentCoursework.length > 0) {
      currentEntry.coursework = currentCoursework;
    }
    saveEntry(entries, currentEntry);
  }

  return entries;
}

function extractDegree(line: string): string | null {
  for (const pattern of DEGREE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

function extractGPA(line: string): string | null {
  const match = line.match(GPA_RE);
  if (match) {
    const value = match[1];
    const scale = match[2];
    return scale ? `${value}/${scale}` : value;
  }
  return null;
}

function extractDates(
  line: string
): { start: string; end: string } | null {
  const match = line.match(EDU_DATE_RE);
  if (match) {
    const startMonth = match[1] ?? "";
    const startYear = match[2] ?? "";
    const endMonth = match[3] ?? "";
    const endYear = match[4] ?? "";

    const start = startMonth ? `${startMonth} ${startYear}` : startYear;
    const end = endYear
      ? endMonth
        ? `${endMonth} ${endYear}`
        : endYear
      : "Present";
    return { start, end };
  }
  return null;
}

function saveEntry(
  entries: EducationEntry[],
  entry: Partial<EducationEntry>
): void {
  entries.push({
    id: nanoid(),
    institution: entry.institution ?? "",
    degree: entry.degree ?? "",
    field: entry.field ?? "",
    startDate: entry.startDate ?? "",
    endDate: entry.endDate,
    gpa: entry.gpa,
    honors: entry.honors,
    coursework: entry.coursework,
  });
}
