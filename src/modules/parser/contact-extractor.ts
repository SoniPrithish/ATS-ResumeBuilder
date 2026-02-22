/**
 * @module modules/parser/contact-extractor
 * @description Extracts contact information from the first 8 lines of resume text.
 * Uses regex patterns for email, phone, LinkedIn, GitHub, website, and location.
 */

import type { ContactInfo } from "./types";

/** Regex patterns for contact fields */
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE =
  /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_RE = /linkedin\.com\/in\/[\w-]+/i;
const GITHUB_RE = /github\.com\/[\w-]+/i;
const URL_RE = /https?:\/\/[^\s,]+/gi;
const LOCATION_RE =
  /([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/;

/**
 * Extract contact information from resume text.
 * Scans the first 8 non-empty lines for contact fields.
 * Returns null for any field not found (never throws).
 *
 * @param text - The raw resume text
 * @returns ContactInfo with extracted fields
 */
export function extractContact(text: string): ContactInfo {
  const lines = text.split("\n").slice(0, 15);
  const headerLines = lines.filter((l) => l.trim().length > 0).slice(0, 8);

  const headerBlock = headerLines.join("\n");

  const email = extractEmail(headerBlock);
  const phone = extractPhone(headerBlock);
  const linkedin = extractLinkedIn(headerBlock);
  const github = extractGitHub(headerBlock);
  const website = extractWebsite(headerBlock, linkedin, github);
  const location = extractLocation(headerBlock);
  const fullName = extractName(headerLines, email, phone);

  return {
    fullName: fullName ?? "",
    email: email ?? "",
    phone: phone ?? undefined,
    location: location ?? undefined,
    linkedin: linkedin ?? undefined,
    github: github ?? undefined,
    website: website ?? undefined,
  };
}

function extractEmail(text: string): string | null {
  const match = text.match(EMAIL_RE);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(PHONE_RE);
  return match ? match[0] : null;
}

function extractLinkedIn(text: string): string | null {
  const match = text.match(LINKEDIN_RE);
  return match ? `https://${match[0]}` : null;
}

function extractGitHub(text: string): string | null {
  const match = text.match(GITHUB_RE);
  return match ? `https://${match[0]}` : null;
}

function extractWebsite(
  text: string,
  _linkedin: string | null,
  _github: string | null
): string | null {
  const urls = text.match(URL_RE);
  if (!urls) return null;

  for (const url of urls) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host === "linkedin.com" || host.endsWith(".linkedin.com")) continue;
      if (host === "github.com" || host.endsWith(".github.com")) continue;
    } catch {
      // If URL parsing fails, use string check as fallback
      const lower = url.toLowerCase();
      if (/(?:^|\.)linkedin\.com(?:\/|$)/i.test(lower)) continue;
      if (/(?:^|\.)github\.com(?:\/|$)/i.test(lower)) continue;
    }
    return url;
  }
  return null;
}

function extractLocation(text: string): string | null {
  const match = text.match(LOCATION_RE);
  return match ? match[0] : null;
}

function extractName(
  lines: string[],
  email: string | null,
  phone: string | null
): string | null {
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    if (trimmed.length >= 60) continue;
    if (email && trimmed.includes(email)) continue;
    if (phone && trimmed.includes(phone)) continue;
    if (/https?:\/\//i.test(trimmed)) continue;
    if (EMAIL_RE.test(trimmed) && trimmed.match(EMAIL_RE)?.[0] === trimmed)
      continue;
    // First non-empty, non-contact line is likely the name
    return trimmed;
  }
  return null;
}
