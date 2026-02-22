/**
 * @module modules/parser/linkedin-pdf-parser
 * @description Parses LinkedIn PDF export format into CanonicalResume.
 * LinkedIn PDFs have a specific structure: name, headline, location,
 * then sections like Experience, Education, Skills, etc.
 */

import { nanoid } from "nanoid";
import type { CanonicalResume, ExperienceEntry, EducationEntry } from "./types";

/** LinkedIn date pattern: "Mon YYYY - Mon YYYY" or "Mon YYYY - Present" */
const LINKEDIN_DATE_RE =
  /^((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4})\s*-\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|Present)$/i;

/** LinkedIn section headers */
const LINKEDIN_SECTIONS = [
  "Experience",
  "Education",
  "Skills",
  "Licenses & Certifications",
  "Certifications",
  "Projects",
  "Volunteer Experience",
  "Honors & Awards",
  "Languages",
  "Publications",
  "Summary",
  "About",
];

/**
 * Detect if text appears to be from a LinkedIn PDF export.
 *
 * @param text - The raw text to check
 * @returns Whether the text matches LinkedIn PDF format
 */
export function isLinkedInFormat(text: string): boolean {
  const lower = text.toLowerCase();
  if (lower.includes("linkedin.com")) return true;

  // Check for LinkedIn-specific section naming
  let sectionCount = 0;
  for (const section of LINKEDIN_SECTIONS) {
    if (text.includes(section)) {
      sectionCount++;
    }
  }
  return sectionCount >= 3;
}

/**
 * Parse a LinkedIn PDF export into CanonicalResume format.
 *
 * @param text - The raw text from a LinkedIn PDF
 * @returns Parsed CanonicalResume
 */
export function parseLinkedInPdf(text: string): CanonicalResume {
  const lines = text.split("\n").map((l) => l.trim());
  const nonEmptyLines = lines.filter((l) => l.length > 0);

  // Line 1: Full name, Line 2: Headline/title, Line 3: Location
  const fullName = nonEmptyLines[0] ?? "";
  const headline = nonEmptyLines[1] ?? "";
  const location = nonEmptyLines[2] ?? "";

  // Find sections
  const sectionMap = extractLinkedInSections(lines);

  // Parse experience
  const experience = parseLinkedInExperience(
    sectionMap.get("Experience") ?? []
  );

  // Parse education
  const education = parseLinkedInEducation(sectionMap.get("Education") ?? []);

  // Parse skills
  const skillLines = sectionMap.get("Skills") ?? [];
  const skillNames = skillLines.filter((l) => l.length > 0 && l.length < 60);

  return {
    contactInfo: {
      fullName,
      email: "",
      location: location || undefined,
    },
    summary: headline || undefined,
    experience,
    education,
    skills: {
      technical: skillNames,
      soft: [],
      tools: [],
    },
    projects: [],
    certifications: [],
  };
}

function extractLinkedInSections(
  lines: string[]
): Map<string, string[]> {
  const sections = new Map<string, string[]>();
  let currentSection: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line is a section header
    if (LINKEDIN_SECTIONS.includes(trimmed)) {
      if (currentSection) {
        sections.set(currentSection, currentLines);
      }
      currentSection = trimmed;
      currentLines = [];
      continue;
    }

    if (currentSection) {
      currentLines.push(trimmed);
    }
  }

  if (currentSection) {
    sections.set(currentSection, currentLines);
  }

  return sections;
}

function parseLinkedInExperience(lines: string[]): ExperienceEntry[] {
  const entries: ExperienceEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line || line.length === 0) {
      i++;
      continue;
    }

    // In LinkedIn format: Title, then Company, then Date range, then Description
    const title = line;
    const company = lines[i + 1] ?? "";
    const dateLine = lines[i + 2] ?? "";
    const dateMatch = dateLine.match(LINKEDIN_DATE_RE);

    if (dateMatch) {
      const bullets: string[] = [];
      let j = i + 3;
      while (j < lines.length && lines[j].length > 0) {
        bullets.push(lines[j]);
        j++;
        // Stop if two lines ahead looks like a date range (new entry pattern)
        if (j + 2 < lines.length && LINKEDIN_DATE_RE.test(lines[j + 2] ?? "")) {
          break;
        }
      }

      entries.push({
        id: nanoid(),
        company,
        title,
        startDate: dateMatch[1],
        endDate: dateMatch[2] === "Present" ? undefined : dateMatch[2],
        current: dateMatch[2] === "Present",
        bullets,
      });

      i = j;
    } else {
      i++;
    }
  }

  return entries;
}

function parseLinkedInEducation(lines: string[]): EducationEntry[] {
  const entries: EducationEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line || line.length === 0) {
      i++;
      continue;
    }

    // LinkedIn education: Institution, Degree + Field, Dates
    const institution = line;
    const degreeLine = lines[i + 1] ?? "";
    const dateLine = lines[i + 2] ?? "";

    let degree = degreeLine;
    let field = "";

    // Split degree and field if comma separated
    if (degreeLine.includes(",")) {
      const parts = degreeLine.split(",");
      degree = parts[0].trim();
      field = parts.slice(1).join(",").trim();
    }

    const yearMatch = dateLine.match(/\d{4}/);

    entries.push({
      id: nanoid(),
      institution,
      degree,
      field,
      startDate: "",
      endDate: yearMatch ? yearMatch[0] : undefined,
    });

    i += 3;
    // Skip any additional lines until next entry
    while (i < lines.length && lines[i].length > 0) {
      i++;
    }
  }

  return entries;
}
