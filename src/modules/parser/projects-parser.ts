/**
 * @module modules/parser/projects-parser
 * @description Parses project entries from resume text.
 * Detects project names, descriptions, technologies, URLs, and bullet points.
 */

import { nanoid } from "nanoid";
import type { ProjectEntry } from "./types";

/** URL pattern */
const URL_RE = /https?:\/\/[^\s,)]+/gi;

/** Technology parenthetical pattern */
const TECH_PAREN_RE = /\(([^)]+)\)\s*$/;

/** Technology header pattern */
const TECH_HEADER_RE = /^(?:tech(?:nologies|nical)?\s*(?:stack)?|built\s+with|stack)[:\s]+(.+)$/i;

/** Bullet pattern */
const BULLET_RE = /^\s*[-•*>]\s+/;

/**
 * Parse project entries from a section's text.
 *
 * @param sectionText - The raw text of the projects section
 * @returns Array of parsed project entries
 */
export function parseProjects(sectionText: string): ProjectEntry[] {
  if (!sectionText || sectionText.trim().length === 0) {
    return [];
  }

  const lines = sectionText.split("\n");
  const entries: ProjectEntry[] = [];
  let currentEntry: Partial<ProjectEntry> | null = null;
  let currentHighlights: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) {
      // Empty line might signal end of entry for compact entries
      continue;
    }

    // Check for bullet
    if (BULLET_RE.test(line)) {
      const bulletText = line.replace(BULLET_RE, "").trim();
      if (bulletText.length > 0) {
        currentHighlights.push(bulletText);
      }
      continue;
    }

    // Check for tech header line
    const techHeaderMatch = line.match(TECH_HEADER_RE);
    if (techHeaderMatch && currentEntry) {
      const techs = techHeaderMatch[1]
        .split(/[,|;]/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      currentEntry.technologies = [
        ...(currentEntry.technologies ?? []),
        ...techs,
      ];
      continue;
    }

    // Check if this line looks like a new project title
    // (non-bullet, non-indented, relatively short)
    if (line.length < 100 && !BULLET_RE.test(line)) {
      // Could be project name or description
      const urls = line.match(URL_RE);
      const techMatch = line.match(TECH_PAREN_RE);

      // Check if it looks like a new entry header
      const isHeader =
        i === 0 ||
        (currentEntry !== null && currentHighlights.length > 0) ||
        (lines[i - 1]?.trim().length === 0 && !techMatch && !urls);

      if (!currentEntry || isHeader) {
        // Save previous entry
        if (currentEntry && currentEntry.name) {
          saveEntry(entries, currentEntry, currentHighlights);
        }

        let name = line;
        const technologies: string[] = [];

        // Extract tech from parenthetical
        if (techMatch) {
          name = line.replace(TECH_PAREN_RE, "").trim();
          const techs = techMatch[1]
            .split(/[,|;]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          technologies.push(...techs);
        }

        // Extract URL
        let url: string | undefined;
        if (urls) {
          url = urls[0];
          name = name.replace(URL_RE, "").trim();
        }

        currentEntry = {
          name: name.replace(/[-–—|]$/, "").trim(),
          technologies,
          url,
        };
        currentHighlights = [];
        continue;
      }

      // Additional description line
      if (currentEntry) {
        if (!currentEntry.description) {
          currentEntry.description = line;
        }

        // Check for URL
        if (urls && !currentEntry.url) {
          currentEntry.url = urls[0];
        }

        // Check for tech parenthetical
        if (techMatch) {
          const techs = techMatch[1]
            .split(/[,|;]/)
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          currentEntry.technologies = [
            ...(currentEntry.technologies ?? []),
            ...techs,
          ];
        }
      }
    }
  }

  // Save last entry
  if (currentEntry && currentEntry.name) {
    saveEntry(entries, currentEntry, currentHighlights);
  }

  return entries;
}

function saveEntry(
  entries: ProjectEntry[],
  entry: Partial<ProjectEntry>,
  highlights: string[]
): void {
  entries.push({
    id: nanoid(),
    name: entry.name ?? "",
    description: entry.description ?? "",
    url: entry.url,
    technologies: entry.technologies ?? [],
    highlights: highlights.length > 0 ? highlights : undefined,
  });
}
