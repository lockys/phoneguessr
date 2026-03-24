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

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ManifestEntry } from './collect-images';

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

// ─── API Client ───────────────────────────────────────────────────────────────

const WIKIMEDIA_API = 'https://commons.wikimedia.org/w/api.php';
const USER_AGENT = 'PhoneGuessr/1.0 (https://github.com/calvinjeng/guess-game) fetch-wikimedia-images/1.0';

/**
 * Search Wikimedia Commons for a phone image.
 * Uses generator=search to get imageinfo in one request.
 * Returns the best CC-licensed portrait image, or null if none found.
 */
export async function fetchWikimediaImage(
  brand: string,
  model: string,
): Promise<WikiImageCandidate | null> {
  const query = encodeURIComponent(`"${brand} ${model}"`);
  const url =
    `${WIKIMEDIA_API}?action=query` +
    `&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=10` +
    `&prop=imageinfo&iiprop=url%7Cextmetadata%7Csize` +
    `&iiextmetadatafilter=LicenseShortName%7CArtist%7CLicenseUrl` +
    `&format=json&origin=*`;

  let data: Record<string, unknown> = {};
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    if (!res.ok) return null;
    data = await res.json() as Record<string, unknown>;
  } catch {
    return null;
  }

  const pages = (data as { query?: { pages?: Record<string, unknown> } })?.query?.pages;
  if (!pages || Object.keys(pages).length === 0) return null;

  const candidates: WikiImageCandidate[] = [];

  for (const page of Object.values(pages) as Array<{
    title: string;
    imageinfo?: Array<{
      url: string;
      width: number;
      height: number;
      extmetadata?: {
        LicenseShortName?: { value: string };
        Artist?: { value: string };
        LicenseUrl?: { value: string };
      };
    }>;
  }>) {
    const info = page.imageinfo?.[0];
    if (!info) continue;

    const license = info.extmetadata?.LicenseShortName?.value ?? '';
    if (!isLicenseAccepted(license)) continue;

    candidates.push({
      title: page.title,
      url: info.url,
      width: info.width,
      height: info.height,
      license,
      attribution: stripHtml(info.extmetadata?.Artist?.value ?? ''),
      licenseUrl: info.extmetadata?.LicenseUrl?.value ?? '',
    });
  }

  return selectBestImage(candidates, model);
}

/** Strip HTML tags from attribution strings */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

// ─── Gap Tracking ─────────────────────────────────────────────────────────────

export interface GapEntry {
  brand: string;
  model: string;
}

/** Merge two gap lists, deduplicating by brand|model key */
export function mergeGaps(existing: GapEntry[], newGaps: GapEntry[]): GapEntry[] {
  const seen = new Set(existing.map(g => `${g.brand}|${g.model}`));
  const merged = [...existing];
  for (const gap of newGaps) {
    const key = `${gap.brand}|${gap.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(gap);
    }
  }
  return merged;
}

// ─── Manifest Update ──────────────────────────────────────────────────────────

/**
 * Merge newEntries into existingEntries.
 * - overwrite=false: skip entries whose brand|model already exists
 * - overwrite=true:  replace entries whose brand|model already exists
 */
export function applyManifestUpdate(
  existing: ManifestEntry[],
  newEntries: ManifestEntry[],
  overwrite: boolean,
): ManifestEntry[] {
  const keyMap = new Map<string, number>();
  const result = [...existing];

  for (let i = 0; i < result.length; i++) {
    keyMap.set(`${result[i].brand}|${result[i].model}`, i);
  }

  for (const entry of newEntries) {
    const key = `${entry.brand}|${entry.model}`;
    if (keyMap.has(key)) {
      if (overwrite) {
        result[keyMap.get(key)!] = entry;
      }
      // else: skip
    } else {
      keyMap.set(key, result.length);
      result.push(entry);
    }
  }

  return result;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, 'press-kit-manifest.json');
const GAPS_PATH = join(__dirname, 'gaps.json');

// ─── Phone Model List ─────────────────────────────────────────────────────────

interface PhoneSpec {
  brand: string;
  model: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PHONE_MODELS: PhoneSpec[] = [
  // === Apple (easy) ===
  { brand: 'Apple', model: 'iPhone 16 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 15', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 14', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone 13', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Apple', model: 'iPhone SE (2022)', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },

  // === Samsung (easy) ===
  { brand: 'Samsung', model: 'Galaxy S24 Ultra', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy S23', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy Z Fold 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'fold', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy Z Flip 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'easy' },
  { brand: 'Samsung', model: 'Galaxy A54', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },

  // === Google (easy) ===
  { brand: 'Google', model: 'Pixel 9 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 8', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 7a', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 6', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Google', model: 'Pixel 5', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },

  // === Motorola (easy) ===
  { brand: 'Motorola', model: 'Edge 50 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Moto G85', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Edge 40', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Moto G73', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Motorola', model: 'Razr 40 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'easy' },

  // === Nokia (easy) ===
  { brand: 'Nokia', model: 'G42', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: 'G21', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: 'X30', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: '5.4', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },
  { brand: 'Nokia', model: '3.4', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'easy' },

  // === OnePlus (medium) ===
  { brand: 'OnePlus', model: '12', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: '11', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: '10 Pro', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: 'Nord 3', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OnePlus', model: 'Nord CE 3', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Xiaomi (medium) ===
  { brand: 'Xiaomi', model: '14 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: '13', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: '12', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: 'Redmi Note 13', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Xiaomi', model: 'Mi 11', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Sony (medium) ===
  { brand: 'Sony', model: 'Xperia 1 VI', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 5 V', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 10 V', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 1 IV', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony', model: 'Xperia 5 III', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Huawei (medium) ===
  { brand: 'Huawei', model: 'P60 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Mate 60 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Nova 11', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'P50', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Huawei', model: 'Mate 40 Pro', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === LG (medium) ===
  { brand: 'LG', model: 'Wing', releaseYear: 2020, priceTier: 'flagship', formFactor: 'fold', difficulty: 'medium' },
  { brand: 'LG', model: 'Velvet', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'V60 ThinQ', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'G8X ThinQ', releaseYear: 2019, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'LG', model: 'K61', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === HTC (medium) ===
  { brand: 'HTC', model: 'U23 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'Desire 22 Pro', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'U20 5G', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'Desire 20 Pro', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'HTC', model: 'U12+', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === BlackBerry (medium) ===
  { brand: 'BlackBerry', model: 'Key2', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Key2 LE', releaseYear: 2018, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Motion', releaseYear: 2017, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'KEYone', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'BlackBerry', model: 'Priv', releaseYear: 2015, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === OPPO (medium) ===
  { brand: 'OPPO', model: 'Find X7', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Reno 11', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Find N3 Flip', releaseYear: 2023, priceTier: 'flagship', formFactor: 'flip', difficulty: 'medium' },
  { brand: 'OPPO', model: 'A98', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'OPPO', model: 'Reno 10', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Vivo (medium) ===
  { brand: 'Vivo', model: 'X100 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'V29', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'Y100', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'X90', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Vivo', model: 'T2 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === ASUS (medium) ===
  { brand: 'ASUS', model: 'ROG Phone 8', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'Zenfone 10', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'ROG Phone 6', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'Zenfone 9', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ASUS', model: 'ROG Phone 5', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Nothing (hard) ===
  { brand: 'Nothing', model: 'Phone 2', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 1', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 2a', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'CMF Phone 1', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nothing', model: 'Phone 2a Plus', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },

  // === Realme (medium) ===
  { brand: 'Realme', model: '12 Pro+', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'GT 5', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'C55', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'GT Neo 5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Realme', model: 'Narzo 60', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },

  // === Honor (medium) ===
  { brand: 'Honor', model: 'Magic 6 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: '90', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: 'X9b', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: 'Magic 5 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Honor', model: '70', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'medium' },

  // === Fairphone (hard) ===
  { brand: 'Fairphone', model: '5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '4', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '3+', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '3', releaseYear: 2019, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Fairphone', model: '2', releaseYear: 2015, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },

  // === Lenovo (medium) ===
  { brand: 'Lenovo', model: 'Legion Phone Duel 3', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Lenovo', model: 'ThinkPhone', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Lenovo', model: 'K15 Plus', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },

  // === ZTE (medium) ===
  { brand: 'ZTE', model: 'Axon 50 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ZTE', model: 'Blade V50', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'ZTE', model: 'Axon 40 Ultra', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },

  // === Poco (hard) ===
  { brand: 'Poco', model: 'X6 Pro', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'F5', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'M6 Pro', releaseYear: 2024, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'X5 Pro', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Poco', model: 'F4 GT', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Redmi (hard) ===
  { brand: 'Redmi', model: 'Note 13 Pro+', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: '13C', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'Note 12 Pro', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'Note 11S', releaseYear: 2022, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Redmi', model: 'A2+', releaseYear: 2023, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === TCL (hard) ===
  { brand: 'TCL', model: '40 NxtPaper', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '30 SE', releaseYear: 2022, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '20 Pro 5G', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '10 Pro', releaseYear: 2020, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'TCL', model: '10L', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === Sharp (hard) ===
  { brand: 'Sharp', model: 'Aquos R8 Pro', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos sense8', releaseYear: 2023, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos R7', releaseYear: 2022, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos zero6', releaseYear: 2021, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Sharp', model: 'Aquos R5G', releaseYear: 2020, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Meizu (hard) ===
  { brand: 'Meizu', model: '21', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Meizu', model: '20', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Meizu', model: '18', releaseYear: 2021, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Alcatel (hard) ===
  { brand: 'Alcatel', model: '3L (2021)', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Alcatel', model: '1S (2021)', releaseYear: 2021, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Alcatel', model: '3X (2020)', releaseYear: 2020, priceTier: 'budget', formFactor: 'bar', difficulty: 'hard' },

  // === iQOO (hard) ===
  { brand: 'iQOO', model: '12', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'iQOO', model: 'Neo 9', releaseYear: 2024, priceTier: 'mid', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'iQOO', model: '11', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Nubia (hard) ===
  { brand: 'Nubia', model: 'Z60 Ultra', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nubia', model: 'Red Magic 9 Pro', releaseYear: 2024, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Nubia', model: 'Z50 Ultra', releaseYear: 2023, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Razer (hard) ===
  { brand: 'Razer', model: 'Phone 2', releaseYear: 2018, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },
  { brand: 'Razer', model: 'Phone', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Essential (hard) ===
  { brand: 'Essential', model: 'PH-1', releaseYear: 2017, priceTier: 'flagship', formFactor: 'bar', difficulty: 'hard' },

  // === Sony Ericsson (medium) ===
  { brand: 'Sony Ericsson', model: 'Xperia Arc', releaseYear: 2011, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
  { brand: 'Sony Ericsson', model: 'Xperia X10', releaseYear: 2010, priceTier: 'flagship', formFactor: 'bar', difficulty: 'medium' },
];

// ─── File I/O ─────────────────────────────────────────────────────────────────

function loadManifest(): ManifestEntry[] {
  if (!existsSync(MANIFEST_PATH)) return [];
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8')) as ManifestEntry[];
}

function saveManifest(entries: ManifestEntry[]): void {
  writeFileSync(MANIFEST_PATH, JSON.stringify(entries, null, 2) + '\n');
}

function loadGaps(): GapEntry[] {
  if (!existsSync(GAPS_PATH)) return [];
  return JSON.parse(readFileSync(GAPS_PATH, 'utf-8')) as GapEntry[];
}

function saveGaps(gaps: GapEntry[]): void {
  writeFileSync(GAPS_PATH, JSON.stringify(gaps, null, 2) + '\n');
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx phoneguessr/scripts/fetch-wikimedia-images.ts [options]

Options:
  --brand <name>   Only fetch for this brand (e.g. "Samsung")
  --dry-run        Search Wikimedia but do not write manifest
  --overwrite      Replace existing entries by brand|model key
  --help           Show this help
    `.trim());
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const overwrite = args.includes('--overwrite');
  const brandIdx = args.indexOf('--brand');
  const brandFilter = brandIdx !== -1 ? args[brandIdx + 1] : null;

  const phones = brandFilter
    ? PHONE_MODELS.filter(p => p.brand.toLowerCase() === brandFilter.toLowerCase())
    : PHONE_MODELS;

  console.log('PhoneGuessr — Wikimedia Image Fetcher');
  console.log('======================================');
  if (dryRun) console.log('DRY RUN — manifest will not be written');
  if (brandFilter) console.log(`Brand filter: ${brandFilter}`);
  console.log(`Processing ${phones.length} models...\n`);

  const existingManifest = loadManifest();
  const existingGaps = loadGaps();
  const newEntries: ManifestEntry[] = [];
  const newGaps: GapEntry[] = [];

  for (const phone of phones) {
    // Rate limit: 500ms between requests per Wikimedia API etiquette
    await new Promise(r => setTimeout(r, 500));

    const candidate = await fetchWikimediaImage(phone.brand, phone.model);

    if (!candidate) {
      if (dryRun) {
        console.log(`[dry-run] ${phone.brand} ${phone.model}  →  NO IMAGE FOUND`);
      }
      newGaps.push({ brand: phone.brand, model: phone.model });
      continue;
    }

    const entry: ManifestEntry = {
      brand: phone.brand,
      model: phone.model,
      imageUrl: candidate.url,
      releaseYear: phone.releaseYear,
      priceTier: phone.priceTier,
      formFactor: phone.formFactor,
      difficulty: phone.difficulty,
      source: 'wikimedia-commons',
      attribution: candidate.attribution,
      licenseShortName: candidate.license,
      licenseUrl: candidate.licenseUrl,
    };

    if (dryRun) {
      console.log(`[dry-run] ${phone.brand} ${phone.model}  →  ${candidate.url}  (${candidate.license})`);
    } else {
      newEntries.push(entry);
    }
  }

  if (!dryRun) {
    const updatedManifest = applyManifestUpdate(existingManifest, newEntries, overwrite);
    saveManifest(updatedManifest);

    const mergedGaps = mergeGaps(existingGaps, newGaps);
    if (mergedGaps.length > 0) saveGaps(mergedGaps);

    console.log('\n══════════════════════════════════════');
    console.log(`✓ Found:  ${newEntries.length} / ${phones.length}`);
    console.log(`✗ Gaps:   ${newGaps.length}  → written to phoneguessr/scripts/gaps.json`);
    console.log('══════════════════════════════════════\n');
  }
}
