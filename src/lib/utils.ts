/**
 * @module lib/utils
 * @description Shared utility functions used across the application.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

/**
 * Merge Tailwind CSS class names with conflict resolution.
 * Combines clsx (conditional classes) with tailwind-merge (deduplication).
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Format a date into a human-readable string.
 *
 * @param date - The date to format
 * @param formatStr - The date-fns format string (default: "MMM d, yyyy")
 * @returns Formatted date string
 */
export function formatDate(
    date: Date | string,
    formatStr: string = "MMM d, yyyy"
): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return format(d, formatStr);
}

/**
 * Format a date as a relative time string (e.g., "2 hours ago").
 *
 * @param date - The date to format
 * @returns Relative time string
 */
export function formatRelativeDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Truncate a string to a maximum length, appending an ellipsis if needed.
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length (default: 100)
 * @returns The truncated string
 */
export function truncate(str: string, maxLength: number = 100): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Convert a string to a URL-friendly slug.
 *
 * @param str - The string to slugify
 * @returns URL-safe slug
 */
export function slugify(str: string): string {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
 * Format a file size in bytes to a human-readable string.
 *
 * @param bytes - File size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Sleep for a given number of milliseconds.
 * Useful for rate limiting and retry delays.
 *
 * @param ms - Duration in milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
