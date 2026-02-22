/**
 * @module modules/parser/certifications-parser
 * @description Parses certification entries from resume text.
 * Detects certification names, issuers, dates, and credential IDs/URLs.
 */

import { nanoid } from "nanoid";
import type { CertificationEntry } from "./types";

/** Issuer pattern: "by" or "from" followed by issuer name */
const ISSUER_RE = /(?:by|from|issued\s+by|issuer)[:\s]+(.+?)(?:\s*[,|•\-–—]|$)/i;

/** Date pattern for certifications */
const CERT_DATE_RE =
  /(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+)?\d{4}/i;

/** Credential ID pattern */
const CREDENTIAL_ID_RE = /(?:credential\s*(?:id)?|id)[:\s]+([A-Za-z0-9\-_]+)/i;

/** URL pattern */
const URL_RE = /https?:\/\/[^\s,)]+/gi;

/** Bullet pattern */
const BULLET_RE = /^\s*[-•*>]\s+/;

/**
 * Parse certification entries from a section's text.
 *
 * @param sectionText - The raw text of the certifications section
 * @returns Array of parsed certification entries
 */
export function parseCertifications(sectionText: string): CertificationEntry[] {
  if (!sectionText || sectionText.trim().length === 0) {
    return [];
  }

  const lines = sectionText.split("\n");
  const entries: CertificationEntry[] = [];
  let currentEntry: Partial<CertificationEntry> | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length === 0) continue;

    // Remove bullet prefix
    line = line.replace(BULLET_RE, "");

    // Check for URL
    const urls = line.match(URL_RE);

    // Check for credential ID
    const credMatch = line.match(CREDENTIAL_ID_RE);

    // Check for issuer
    const issuerMatch = line.match(ISSUER_RE);

    // Check for date
    const dateMatch = line.match(CERT_DATE_RE);

    // If this line has issuer info and we have a current entry
    if (issuerMatch && currentEntry) {
      currentEntry.issuer = issuerMatch[1].trim();
      if (dateMatch) {
        currentEntry.date = dateMatch[0];
      }
      if (credMatch) {
        currentEntry.credentialId = credMatch[1];
      }
      if (urls && !currentEntry.url) {
        currentEntry.url = urls[0];
      }
      continue;
    }

    // If this line is mainly a URL or credential line for the current entry
    if (currentEntry && (urls || credMatch) && line.length < 150) {
      if (urls && !currentEntry.url) {
        currentEntry.url = urls[0];
      }
      if (credMatch && !currentEntry.credentialId) {
        currentEntry.credentialId = credMatch[1];
      }
      if (dateMatch && !currentEntry.date) {
        currentEntry.date = dateMatch[0];
      }
      continue;
    }

    // This looks like a new certification name
    // Save previous entry
    if (currentEntry && currentEntry.name) {
      entries.push(buildEntry(currentEntry));
    }

    // Start new entry
    let name = line;
    const newEntry: Partial<CertificationEntry> = {};

    // Extract inline issuer
    if (issuerMatch) {
      newEntry.issuer = issuerMatch[1].trim();
      name = name.replace(ISSUER_RE, "").trim();
    }

    // Extract inline date
    if (dateMatch) {
      newEntry.date = dateMatch[0];
      name = name.replace(CERT_DATE_RE, "").trim();
    }

    // Extract inline URL
    if (urls) {
      newEntry.url = urls[0];
      name = name.replace(URL_RE, "").trim();
    }

    // Extract credential ID
    if (credMatch) {
      newEntry.credentialId = credMatch[1];
      name = name.replace(CREDENTIAL_ID_RE, "").trim();
    }

    // Clean up name
    name = name.replace(/[,|•\-–—]+$/, "").trim();

    newEntry.name = name;
    currentEntry = newEntry;
  }

  // Save last entry
  if (currentEntry && currentEntry.name) {
    entries.push(buildEntry(currentEntry));
  }

  return entries;
}

function buildEntry(entry: Partial<CertificationEntry>): CertificationEntry {
  return {
    id: nanoid(),
    name: entry.name ?? "",
    issuer: entry.issuer ?? "",
    date: entry.date ?? "",
    expirationDate: entry.expirationDate,
    credentialId: entry.credentialId,
    url: entry.url,
  };
}
