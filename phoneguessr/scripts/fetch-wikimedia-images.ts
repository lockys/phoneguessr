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
