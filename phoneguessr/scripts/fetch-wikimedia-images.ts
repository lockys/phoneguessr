/**
 * fetch-wikimedia-images.ts
 *
 * Queries Wikimedia Commons for CC-licensed phone images and populates
 * press-kit-manifest.json with legally clear image URLs.
 *
 * Usage:
 *   npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]
 *
 * Options:
 *   --brand <name>   Only fetch for this brand
 *   --dry-run        Search but do not write manifest
 *   --overwrite      Replace existing entries by brand|model key
 *   --help
 */

// ─── License Filter ───────────────────────────────────────────────────────────

const ACCEPTED_LICENSE_PREFIXES = ['CC0', 'Public domain', 'CC BY'];
const REJECTED_LICENSE_TERMS = ['NC', 'ND', 'GFDL', 'All rights reserved'];

/**
 * Returns true if the Wikimedia LicenseShortName value is CC-compatible.
 * Handles dual-licensed strings like "CC BY-SA 3.0 or GFDL".
 */
export function isLicenseAccepted(license: string | undefined): boolean {
  if (!license) return false;

  // For dual-licensed strings, check each component
  const parts = license.split(/\s+or\s+/i);

  for (const part of parts) {
    const trimmed = part.trim();
    const hasAcceptedPrefix = ACCEPTED_LICENSE_PREFIXES.some(p => trimmed.startsWith(p));
    const hasRejectedTerm = REJECTED_LICENSE_TERMS.some(t => trimmed.includes(t));

    if (hasAcceptedPrefix && !hasRejectedTerm) {
      return true;
    }
  }

  return false;
}

// ─── Image Selection ──────────────────────────────────────────────────────────

export interface WikiImageCandidate {
  title: string;     // e.g. "File:Samsung Galaxy S24.jpg"
  url: string;
  width: number;
  height: number;
  license: string;
  attribution: string;
  licenseUrl: string;
}

const FILENAME_BLOCKLIST = ['hand', 'holding', 'person', 'review', 'unbox'];
const ACCEPTED_FORMATS = ['.jpg', '.jpeg', '.png'];

/**
 * From a list of CC-licensed candidates, pick the best image:
 * 1. Skip landscape, blocklisted filenames, non-JPEG/PNG
 * 2. Prefer filename containing model name or "front"
 * 3. Highest pixel area wins ties
 */
export function selectBestImage(
  candidates: WikiImageCandidate[],
  modelName = '',
): WikiImageCandidate | null {
  const filtered = candidates.filter(c => {
    const lower = c.title.toLowerCase();
    if (c.width > c.height) return false;
    if (FILENAME_BLOCKLIST.some(term => lower.includes(term))) return false;
    if (!ACCEPTED_FORMATS.some(ext => lower.endsWith(ext))) return false;
    return true;
  });

  if (filtered.length === 0) return null;

  // Score: 2 points for "front", 1 point for model name in filename
  return filtered.sort((a, b) => {
    const scoreA = filenameScore(a.title, modelName);
    const scoreB = filenameScore(b.title, modelName);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return (b.width * b.height) - (a.width * a.height);
  })[0];
}

function filenameScore(title: string, modelName: string): number {
  const lower = title.toLowerCase();
  let score = 0;
  if (lower.includes('front')) score += 2;
  if (modelName && lower.includes(modelName.toLowerCase())) score += 1;
  return score;
}
