/**
 * @module modules/parser/experience-parser
 * @description Parses work experience sections from resume text.
 * Detects job titles, companies, date ranges, locations, and bullet points.
 */

import { nanoid } from "nanoid";
import type { ExperienceEntry } from "./types";

/** Date range patterns */
const DATE_RANGE_RE =
  /(?:((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—]\s*((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|[Pp]resent|[Cc]urrent))/;

/** Title-company separators */
const TITLE_COMPANY_RE = /^(.+?)\s+(?:at|@)\s+(.+)$/i;
const COMPANY_TITLE_RE = /^(.+?)\s*[—–|]\s*(.+)$/;

/** Bullet prefixes */
const BULLET_RE = /^\s*[-•*>]\s+/;

/** Location pattern */
const LOCATION_RE = /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s*$|^(Remote)\s*$/i;

/**
 * Parse work experience entries from a section's text.
 *
 * @param sectionText - The raw text of the experience section
 * @returns Array of parsed experience entries
 */
export function parseExperience(sectionText: string): ExperienceEntry[] {
  if (!sectionText || sectionText.trim().length === 0) {
    return [];
  }

  const lines = sectionText.split("\n");
  const entries: ExperienceEntry[] = [];
  let currentEntry: Partial<ExperienceEntry> | null = null;
  let currentBullets: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;

    // Check if this line has a date range (likely a new entry or date line)
    const dateMatch = line.match(DATE_RANGE_RE);

    // Check if it's a bullet
    if (BULLET_RE.test(line)) {
      const bulletText = line.replace(BULLET_RE, "").trim();
      if (bulletText.length > 0) {
        currentBullets.push(bulletText);
      }
      continue;
    }

    // Try to detect a title/company line
    const titleCompany = parseTitleCompany(line);

    if (titleCompany && !dateMatch) {
      // Save previous entry
      if (currentEntry && (currentEntry.title || currentEntry.company)) {
        saveEntry(entries, currentEntry, currentBullets);
      }
      currentEntry = {
        title: titleCompany.title,
        company: titleCompany.company,
      };
      currentBullets = [];
      continue;
    }

    if (dateMatch) {
      const startDate = dateMatch[1] ?? "";
      const endDate = dateMatch[2] ?? "";
      const isCurrent =
        /present|current/i.test(endDate);

      // Extract location from same line
      const remaining = line.replace(DATE_RANGE_RE, "").trim();
      const locMatch = remaining.match(LOCATION_RE);

      if (currentEntry) {
        currentEntry.startDate = normalizeDate(startDate);
        currentEntry.endDate = isCurrent ? undefined : normalizeDate(endDate);
        currentEntry.current = isCurrent;
        if (locMatch) {
          currentEntry.location = (locMatch[1] ?? locMatch[2] ?? "").trim();
        }
      } else {
        // Date line before title/company - might have title/company in remaining text
        const titleCompanyInDate = parseTitleCompany(
          remaining.replace(LOCATION_RE, "").trim()
        );
        if (titleCompanyInDate) {
          currentEntry = {
            title: titleCompanyInDate.title,
            company: titleCompanyInDate.company,
            startDate: normalizeDate(startDate),
            endDate: isCurrent ? undefined : normalizeDate(endDate),
            current: isCurrent,
          };
          if (locMatch) {
            currentEntry.location = (locMatch[1] ?? locMatch[2] ?? "").trim();
          }
          currentBullets = [];
        }
      }
      continue;
    }

    // If we have a current entry but no title/company detected and no date,
    // this might be the company or title on a separate line
    if (currentEntry && !currentEntry.company && line.length < 80) {
      currentEntry.company = line;
      continue;
    }

    if (!currentEntry && line.length < 80 && !BULLET_RE.test(line)) {
      // Could be a title line, followed by company on next line
      currentEntry = { title: line };
      currentBullets = [];
      continue;
    }
  }

  // Save last entry
  if (currentEntry && (currentEntry.title || currentEntry.company)) {
    saveEntry(entries, currentEntry, currentBullets);
  }

  return entries;
}

function parseTitleCompany(
  line: string
): { title: string; company: string } | null {
  // "Software Engineer at Google"
  const atMatch = line.match(TITLE_COMPANY_RE);
  if (atMatch) {
    return { title: atMatch[1].trim(), company: atMatch[2].trim() };
  }

  // "Google — Software Engineer" or "Google | Software Engineer"
  const dashMatch = line.match(COMPANY_TITLE_RE);
  if (dashMatch) {
    return { title: dashMatch[2].trim(), company: dashMatch[1].trim() };
  }

  return null;
}

function normalizeDate(dateStr: string): string {
  return dateStr.trim();
}

function saveEntry(
  entries: ExperienceEntry[],
  entry: Partial<ExperienceEntry>,
  bullets: string[]
): void {
  entries.push({
    id: nanoid(),
    company: entry.company ?? "",
    title: entry.title ?? "",
    location: entry.location,
    startDate: entry.startDate ?? "",
    endDate: entry.endDate,
    current: entry.current ?? false,
    bullets,
    technologies: entry.technologies,
  });
}
