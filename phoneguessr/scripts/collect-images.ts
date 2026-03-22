/**
 * collect-images.ts
 *
 * Downloads phone images from a curated press-kit-manifest.json,
 * processes them with Sharp, and generates phone-data.json entries.
 *
 * Usage:
 *   npx tsx phoneguessr/scripts/collect-images.ts [options]
 *
 * Options:
 *   --phase download|process|generate|all   Pipeline phase (default: all)
 *   --brand <name>   Only process entries for this brand (e.g., "Apple")
 *   --dry-run        Validate manifest but do not download images
 *   --help           Show this help message
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STAGING_DIR = join(__dirname, '..', '..', '.staging');
const OUTPUT_DIR = join(__dirname, '..', 'config', 'public', 'phones');
const PHONE_DATA_PATH = join(__dirname, '..', 'src', 'db', 'phone-data.json');
const MANIFEST_PATH = join(__dirname, 'press-kit-manifest.json');

// ─── Interfaces ──────────────────────────────────────────────────────

export interface ManifestEntry {
  brand: string;
  model: string;
  imageUrl: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
}

interface PhoneDataEntry {
  brand: string;
  model: string;
  imagePath: string;
  releaseYear: number;
  priceTier: 'budget' | 'mid' | 'flagship';
  formFactor: 'bar' | 'flip' | 'fold';
  difficulty: 'easy' | 'medium' | 'hard';
}

// ─── Naming Utilities ─────────────────────────────────────────────────

/** Convert brand + model to a kebab-case filename slug */
export function toKebabSlug(brand: string, model: string): string {
  return `${brand}-${model}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Metadata Inference ──────────────────────────────────────────────

/** Infer price tier from brand + model name heuristics */
export function inferPriceTier(brand: string, model: string): 'budget' | 'mid' | 'flagship' {
  const m = model.toLowerCase();

  if (
    m.includes('pro') || m.includes('ultra') || m.includes('plus') ||
    m.includes('max') || m.includes('note') || m.includes('fold') ||
    m.includes('flip') || m.includes('s2') || m.includes('edge+')
  ) {
    return 'flagship';
  }

  const budgetBrands = ['tecno', 'infinix', 'itel', 'micromax', 'karbonn', 'intex', 'lava'];
  if (budgetBrands.includes(brand.toLowerCase())) return 'budget';

  if (
    m.includes('redmi') || m.startsWith('a') || m.startsWith('m') ||
    m.startsWith('j') || m.startsWith('c') || m.includes('lite') ||
    m.includes('neo') || m.includes('play')
  ) {
    return 'budget';
  }

  return 'mid';
}

/** Infer form factor from model name */
export function inferFormFactor(model: string): 'bar' | 'flip' | 'fold' {
  const m = model.toLowerCase();
  if (m.includes('flip') || m.includes('razr') || m.includes('clamshell')) return 'flip';
  if (m.includes('fold') || m.includes('duo')) return 'fold';
  return 'bar';
}

// ─── Network ──────────────────────────────────────────────────────────

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Download an image from a URL to a destination path.
 * Skips if the file already exists (resumability).
 */
export async function downloadImage(url: string, destPath: string): Promise<boolean> {
  if (existsSync(destPath)) {
    return false; // already downloaded
  }

  mkdirSync(dirname(destPath), { recursive: true });

  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) {
    console.warn(`  Failed to download ${url}: HTTP ${response.status}`);
    return false;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(destPath, buffer);
  return true;
}

// ─── Image Processing ─────────────────────────────────────────────────

/**
 * Process a raw image: resize to max 800px, convert to JPEG, target <200KB.
 * Returns false if the image is too small (< 100x100) or processing fails.
 */
export async function processImage(
  inputPath: string,
  outputPath: string,
): Promise<boolean> {
  const sharp = (await import('sharp')).default;

  try {
    const metadata = await sharp(inputPath).metadata();

    if (
      !metadata.width || !metadata.height ||
      metadata.width < 100 || metadata.height < 100
    ) {
      console.warn(`  Skipping ${inputPath}: too small (${metadata.width}x${metadata.height})`);
      return false;
    }

    mkdirSync(dirname(outputPath), { recursive: true });

    let quality = 80;
    await sharp(inputPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toFile(outputPath);

    const { size } = await import('node:fs').then(fs => fs.statSync(outputPath));

    if (size > 200 * 1024) {
      quality = 60;
      await sharp(inputPath)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toFile(outputPath);
    }

    return true;
  } catch (err) {
    console.warn(`  Failed to process ${inputPath}: ${err}`);
    return false;
  }
}

// ─── Pipeline Phases ──────────────────────────────────────────────────

export function loadManifest(brandFilter: string | null): ManifestEntry[] {
  const manifest: ManifestEntry[] = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
  if (brandFilter) {
    return manifest.filter(e => e.brand.toLowerCase() === brandFilter.toLowerCase());
  }
  return manifest;
}

/**
 * Download all manifest images concurrently (up to 10 parallel).
 */
async function phaseDownload(entries: ManifestEntry[], dryRun: boolean): Promise<void> {
  console.log(`\nDownloading ${entries.length} images...`);
  mkdirSync(STAGING_DIR, { recursive: true });

  const concurrency = 10;
  let index = 0;
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  async function worker() {
    while (index < entries.length) {
      const i = index++;
      const entry = entries[i];
      const slug = toKebabSlug(entry.brand, entry.model);
      const rawPath = join(STAGING_DIR, `${slug}.raw`);

      if (dryRun) {
        console.log(`  [dry-run] ${entry.brand} ${entry.model}`);
        continue;
      }

      try {
        const wasNew = await downloadImage(entry.imageUrl, rawPath);
        if (wasNew) {
          downloaded++;
          console.log(`  ↓ ${entry.brand} ${entry.model}`);
        } else {
          skipped++;
        }
      } catch (err) {
        failed++;
        console.warn(`  ✗ ${entry.brand} ${entry.model}: ${err}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`  Downloaded: ${downloaded}, Skipped: ${skipped}, Failed: ${failed}`);
}

/**
 * Process all raw staged images to JPEG.
 */
async function phaseProcess(entries: ManifestEntry[]): Promise<void> {
  console.log('\nProcessing images...');
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of entries) {
    const slug = toKebabSlug(entry.brand, entry.model);
    const rawPath = join(STAGING_DIR, `${slug}.raw`);
    const outputPath = join(OUTPUT_DIR, `${slug}.jpg`);

    if (existsSync(outputPath)) {
      skipped++;
      continue;
    }

    if (!existsSync(rawPath)) {
      console.warn(`  No raw image for ${entry.brand} ${entry.model}`);
      continue;
    }

    const ok = await processImage(rawPath, outputPath);
    if (ok) {
      processed++;
      console.log(`  ✓ ${entry.brand} ${entry.model}`);
    } else {
      failed++;
    }
  }

  console.log(`  Processed: ${processed}, Skipped: ${skipped}, Failed: ${failed}`);
}

/**
 * Generate phone-data.json from manifest entries that have processed images.
 * Merges with existing entries (preserving them).
 */
export function phaseGenerate(entries: ManifestEntry[]): PhoneDataEntry[] {
  let existingData: PhoneDataEntry[] = [];
  if (existsSync(PHONE_DATA_PATH)) {
    existingData = JSON.parse(readFileSync(PHONE_DATA_PATH, 'utf-8'));
  }

  const existingKeys = new Set(existingData.map(p => `${p.brand}|${p.model}`));
  const newEntries: PhoneDataEntry[] = [];

  for (const entry of entries) {
    const key = `${entry.brand}|${entry.model}`;
    if (existingKeys.has(key)) continue;

    const slug = toKebabSlug(entry.brand, entry.model);
    const outputPath = join(OUTPUT_DIR, `${slug}.jpg`);
    if (!existsSync(outputPath)) continue;

    newEntries.push({
      brand: entry.brand,
      model: entry.model,
      imagePath: `/public/phones/${slug}.jpg`,
      releaseYear: entry.releaseYear,
      priceTier: entry.priceTier,
      formFactor: entry.formFactor,
      difficulty: entry.difficulty,
    });
  }

  return [...existingData, ...newEntries];
}

// ─── Report ──────────────────────────────────────────────────────────

function printReport(data: PhoneDataEntry[]) {
  const brands = new Map<string, number>();
  const difficulties = { easy: 0, medium: 0, hard: 0 };

  for (const phone of data) {
    brands.set(phone.brand, (brands.get(phone.brand) || 0) + 1);
    if (phone.difficulty in difficulties) {
      difficulties[phone.difficulty]++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  COLLECTION REPORT');
  console.log('═══════════════════════════════════════');
  console.log(`  Total phones: ${data.length}`);
  console.log(`  Total brands: ${brands.size}`);
  console.log(`  Difficulty: easy=${difficulties.easy}, medium=${difficulties.medium}, hard=${difficulties.hard}`);
  console.log('\n  Phones per brand:');

  const sorted = [...brands.entries()].sort((a, b) => b[1] - a[1]);
  for (const [brand, count] of sorted) {
    console.log(`    ${brand}: ${count}`);
  }
  console.log('═══════════════════════════════════════\n');
}

// ─── CLI Entry Point ──────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--help')) {
    console.log(`
Usage: npx tsx phoneguessr/scripts/collect-images.ts [options]

Options:
  --phase <phase>  Pipeline phase: download, process, generate, all (default: all)
  --brand <name>   Only process entries for this brand (e.g., "Apple")
  --dry-run        Validate manifest but do not download images
  --help           Show this help message
    `.trim());
    process.exit(0);
  }

  const phaseIndex = args.indexOf('--phase');
  const phase = phaseIndex !== -1 ? args[phaseIndex + 1] : 'all';
  const brandIndex = args.indexOf('--brand');
  const brandFilter = brandIndex !== -1 ? args[brandIndex + 1] : null;
  const dryRun = args.includes('--dry-run');

  console.log('PhoneGuessr Image Collector (Press Kit Pipeline)');
  console.log('=================================================');
  if (dryRun) console.log('DRY RUN — no images will be downloaded');
  if (brandFilter) console.log(`Filtering to brand: ${brandFilter}`);
  console.log(`Phase: ${phase}`);
  console.log();

  const entries = loadManifest(brandFilter);
  console.log(`Loaded ${entries.length} manifest entries`);

  try {
    if (phase === 'download' || phase === 'all') {
      await phaseDownload(entries, dryRun);
    }

    if ((phase === 'process' || phase === 'all') && !dryRun) {
      await phaseProcess(entries);
    }

    if ((phase === 'generate' || phase === 'all') && !dryRun) {
      const data = phaseGenerate(entries);
      writeFileSync(PHONE_DATA_PATH, JSON.stringify(data, null, 2) + '\n');
      console.log(`\nWrote ${data.length} entries to phone-data.json`);
      printReport(data);
    }
  } catch (err) {
    console.error('Pipeline failed:', err);
    process.exit(1);
  }
}
