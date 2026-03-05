import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const APPROVED_BRANDS = [
  'Apple',
  'Samsung',
  'Google',
  'OnePlus',
  'Nothing',
  'Xiaomi',
  'Sony',
  'Motorola',
  'Huawei',
  'OPPO',
  'vivo',
  'Realme',
  'ASUS',
  'Honor',
  'ZTE',
  'Nubia',
] as const;

const VALID_PRICE_TIERS = ['budget', 'mid', 'flagship'] as const;
const VALID_FORM_FACTORS = ['bar', 'flip', 'fold'] as const;
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const MIN_RELEASE_YEAR = 2020;
const MAX_RELEASE_YEAR = new Date().getFullYear() + 1;

interface PhoneEntry {
  brand: string;
  model: string;
  imagePath: string;
  releaseYear?: number;
  priceTier?: string;
  formFactor?: string;
  difficulty?: string;
}

interface ValidationResult {
  passed: boolean;
  name: string;
  detail?: string;
}

function loadPhoneData(): PhoneEntry[] {
  const dataPath = join(__dirname, '..', 'src', 'db', 'phone-data.json');
  const raw = readFileSync(dataPath, 'utf-8');
  return JSON.parse(raw) as PhoneEntry[];
}

function validateRequiredFields(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const phone of phones) {
    const id = `${phone.brand} ${phone.model}`;
    if (!phone.brand || typeof phone.brand !== 'string') {
      results.push({
        passed: false,
        name: 'required-fields',
        detail: `${id}: missing brand`,
      });
    }
    if (!phone.model || typeof phone.model !== 'string') {
      results.push({
        passed: false,
        name: 'required-fields',
        detail: `${id}: missing model`,
      });
    }
    if (!phone.imagePath || typeof phone.imagePath !== 'string') {
      results.push({
        passed: false,
        name: 'required-fields',
        detail: `${id}: missing imagePath`,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      passed: true,
      name: 'required-fields',
      detail: `All ${phones.length} phones have brand, model, imagePath`,
    });
  }
  return results;
}

function validateBrandNames(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  const approvedSet = new Set(APPROVED_BRANDS as readonly string[]);

  for (const phone of phones) {
    if (!approvedSet.has(phone.brand)) {
      results.push({
        passed: false,
        name: 'brand-names',
        detail: `"${phone.brand}" is not an approved brand name`,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      passed: true,
      name: 'brand-names',
      detail: 'All brands use approved casing',
    });
  }
  return results;
}

function validateNoDuplicates(phones: PhoneEntry[]): ValidationResult[] {
  const seen = new Set<string>();
  const results: ValidationResult[] = [];

  for (const phone of phones) {
    const key = `${phone.brand}|${phone.model}`;
    if (seen.has(key)) {
      results.push({
        passed: false,
        name: 'no-duplicates',
        detail: `Duplicate: ${phone.brand} ${phone.model}`,
      });
    }
    seen.add(key);
  }

  if (results.length === 0) {
    results.push({
      passed: true,
      name: 'no-duplicates',
      detail: `No duplicates in ${phones.length} entries`,
    });
  }
  return results;
}

function validateMetadataFields(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  let missingCount = 0;

  for (const phone of phones) {
    const id = `${phone.brand} ${phone.model}`;

    if (phone.releaseYear !== undefined) {
      if (
        typeof phone.releaseYear !== 'number' ||
        phone.releaseYear < MIN_RELEASE_YEAR ||
        phone.releaseYear > MAX_RELEASE_YEAR
      ) {
        results.push({
          passed: false,
          name: 'metadata-valid',
          detail: `${id}: releaseYear ${phone.releaseYear} out of range [${MIN_RELEASE_YEAR}, ${MAX_RELEASE_YEAR}]`,
        });
      }
    } else {
      missingCount++;
    }

    if (
      phone.priceTier !== undefined &&
      !(VALID_PRICE_TIERS as readonly string[]).includes(phone.priceTier)
    ) {
      results.push({
        passed: false,
        name: 'metadata-valid',
        detail: `${id}: invalid priceTier "${phone.priceTier}"`,
      });
    }
    if (
      phone.formFactor !== undefined &&
      !(VALID_FORM_FACTORS as readonly string[]).includes(phone.formFactor)
    ) {
      results.push({
        passed: false,
        name: 'metadata-valid',
        detail: `${id}: invalid formFactor "${phone.formFactor}"`,
      });
    }
    if (
      phone.difficulty !== undefined &&
      !(VALID_DIFFICULTIES as readonly string[]).includes(phone.difficulty)
    ) {
      results.push({
        passed: false,
        name: 'metadata-valid',
        detail: `${id}: invalid difficulty "${phone.difficulty}"`,
      });
    }
  }

  if (missingCount > 0) {
    results.push({
      passed: false,
      name: 'metadata-present',
      detail: `${missingCount}/${phones.length} phones missing metadata fields (expected after expansion)`,
    });
  }

  if (results.length === 0) {
    results.push({
      passed: true,
      name: 'metadata-valid',
      detail: 'All metadata fields have valid values',
    });
  }
  return results;
}

function validateImageFiles(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  const imagesDir = join(__dirname, '..', '..', 'config', 'public', 'phones');
  let missingCount = 0;

  for (const phone of phones) {
    const filename = phone.imagePath.replace('/public/phones/', '');
    const fullPath = join(imagesDir, filename);
    if (!existsSync(fullPath)) {
      missingCount++;
      if (missingCount <= 5) {
        results.push({
          passed: false,
          name: 'image-files',
          detail: `Missing image: ${filename}`,
        });
      }
    }
  }

  if (missingCount > 5) {
    results.push({
      passed: false,
      name: 'image-files',
      detail: `... and ${missingCount - 5} more missing images`,
    });
  }

  if (missingCount === 0) {
    results.push({
      passed: true,
      name: 'image-files',
      detail: `All ${phones.length} phone images found`,
    });
  }
  return results;
}

function validateCatalogTargets(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Catalog size target: 120+
  if (phones.length >= 120) {
    results.push({
      passed: true,
      name: 'catalog-size',
      detail: `${phones.length} phones (target: 120+)`,
    });
  } else {
    results.push({
      passed: false,
      name: 'catalog-size',
      detail: `${phones.length} phones (target: 120+)`,
    });
  }

  // Brand count target: 15+
  const brands = new Set(phones.map(p => p.brand));
  if (brands.size >= 15) {
    results.push({
      passed: true,
      name: 'brand-count',
      detail: `${brands.size} brands (target: 15+)`,
    });
  } else {
    results.push({
      passed: false,
      name: 'brand-count',
      detail: `${brands.size} brands (target: 15+)`,
    });
  }

  // Brand distribution: no brand > 20%
  const brandCounts = new Map<string, number>();
  for (const phone of phones) {
    brandCounts.set(phone.brand, (brandCounts.get(phone.brand) || 0) + 1);
  }
  let distributionOk = true;
  for (const [brand, count] of brandCounts) {
    const pct = (count / phones.length) * 100;
    if (pct > 20) {
      results.push({
        passed: false,
        name: 'brand-distribution',
        detail: `${brand}: ${count} phones (${pct.toFixed(1)}% > 20% max)`,
      });
      distributionOk = false;
    }
  }
  if (distributionOk) {
    results.push({
      passed: true,
      name: 'brand-distribution',
      detail: 'No brand exceeds 20% of catalog',
    });
  }

  // Difficulty distribution (only if metadata present)
  const withDifficulty = phones.filter(p => p.difficulty);
  if (withDifficulty.length > 0) {
    const diffCounts = { easy: 0, medium: 0, hard: 0 };
    for (const p of withDifficulty) {
      if (p.difficulty === 'easy') diffCounts.easy++;
      else if (p.difficulty === 'medium') diffCounts.medium++;
      else if (p.difficulty === 'hard') diffCounts.hard++;
    }
    const total = withDifficulty.length;
    const easyPct = (diffCounts.easy / total) * 100;
    const medPct = (diffCounts.medium / total) * 100;
    const hardPct = (diffCounts.hard / total) * 100;

    if (easyPct >= 25 && medPct >= 25 && hardPct >= 20) {
      results.push({
        passed: true,
        name: 'difficulty-distribution',
        detail: `easy: ${easyPct.toFixed(0)}%, medium: ${medPct.toFixed(0)}%, hard: ${hardPct.toFixed(0)}%`,
      });
    } else {
      results.push({
        passed: false,
        name: 'difficulty-distribution',
        detail: `easy: ${easyPct.toFixed(0)}% (≥25%), medium: ${medPct.toFixed(0)}% (≥25%), hard: ${hardPct.toFixed(0)}% (≥20%)`,
      });
    }
  }

  return results;
}

function validateFileNaming(phones: PhoneEntry[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  const pattern = /^\/public\/phones\/[a-z0-9-]+\.(jpg|png)$/;

  for (const phone of phones) {
    if (!pattern.test(phone.imagePath)) {
      results.push({
        passed: false,
        name: 'file-naming',
        detail: `${phone.brand} ${phone.model}: imagePath "${phone.imagePath}" doesn't match convention`,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      passed: true,
      name: 'file-naming',
      detail: 'All image paths follow naming convention',
    });
  }
  return results;
}

// --- Main ---

console.log('Phone Data Validation');
console.log('=====================\n');

const phones = loadPhoneData();
console.log(`Loaded ${phones.length} phone entries from phone-data.json\n`);

const allResults: ValidationResult[] = [
  ...validateRequiredFields(phones),
  ...validateBrandNames(phones),
  ...validateNoDuplicates(phones),
  ...validateFileNaming(phones),
  ...validateImageFiles(phones),
  ...validateMetadataFields(phones),
  ...validateCatalogTargets(phones),
];

const passed = allResults.filter(r => r.passed);
const failed = allResults.filter(r => !r.passed);

if (passed.length > 0) {
  console.log('PASS:');
  for (const r of passed) {
    console.log(`  ✓ [${r.name}] ${r.detail}`);
  }
}

if (failed.length > 0) {
  console.log('\nFAIL (expected gaps before expansion):');
  for (const r of failed) {
    console.log(`  ✗ [${r.name}] ${r.detail}`);
  }
}

console.log(`\nSummary: ${passed.length} passed, ${failed.length} failed`);

// Exit with code 0 even on failures since current data is pre-expansion
// Use --strict flag to enforce all checks
if (process.argv.includes('--strict')) {
  process.exit(failed.length > 0 ? 1 : 0);
}
