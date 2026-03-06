import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import phoneData from './phone-data.json';

const MIN_PHONE_COUNT = 120;
const MIN_BRAND_COUNT = 10;

describe('phone-data.json', () => {
  it(`has at least ${MIN_PHONE_COUNT} phones`, () => {
    expect(phoneData.length).toBeGreaterThanOrEqual(MIN_PHONE_COUNT);
  });

  it(`has at least ${MIN_BRAND_COUNT} brands`, () => {
    const brands = new Set(phoneData.map(p => p.brand));
    expect(brands.size).toBeGreaterThanOrEqual(MIN_BRAND_COUNT);
  });

  it('has no duplicate brand+model combinations', () => {
    const keys = phoneData.map(p => `${p.brand}|${p.model}`);
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(duplicates).toEqual([]);
  });

  it('every phone has brand, model, and imagePath', () => {
    for (const phone of phoneData) {
      expect(phone.brand).toBeTruthy();
      expect(phone.model).toBeTruthy();
      expect(phone.imagePath).toBeTruthy();
    }
  });

  it('imagePath follows naming convention', () => {
    for (const phone of phoneData) {
      expect(phone.imagePath).toMatch(
        /^\/public\/phones\/[\w-]+\.(jpg|png|svg)$/,
      );
    }
  });

  it('every phone has an image file on disk', () => {
    const missing: string[] = [];
    for (const phone of phoneData) {
      const filePath = resolve(
        'config/public',
        phone.imagePath.replace(/^\/public\//, ''),
      );
      if (!existsSync(filePath)) {
        missing.push(`${phone.brand} ${phone.model}: ${phone.imagePath}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('no brand exceeds 20% of catalog', () => {
    const brandCounts = new Map<string, number>();
    for (const phone of phoneData) {
      brandCounts.set(phone.brand, (brandCounts.get(phone.brand) || 0) + 1);
    }
    for (const [, count] of brandCounts) {
      const pct = (count / phoneData.length) * 100;
      expect(pct).toBeLessThanOrEqual(20);
    }
  });
});

describe('phone-data.json metadata (future expansion)', () => {
  const hasMetadata = phoneData.length > 0 && 'releaseYear' in phoneData[0];

  it.skipIf(!hasMetadata)(
    'every phone has releaseYear between 2020-2026',
    () => {
      for (const phone of phoneData) {
        expect(
          (phone as { releaseYear: number }).releaseYear,
        ).toBeGreaterThanOrEqual(2020);
        expect(
          (phone as { releaseYear: number }).releaseYear,
        ).toBeLessThanOrEqual(2026);
      }
    },
  );

  it.skipIf(!hasMetadata)('every phone has valid priceTier', () => {
    for (const phone of phoneData) {
      expect(['budget', 'mid-range', 'flagship']).toContain(
        (phone as { priceTier: string }).priceTier,
      );
    }
  });

  it.skipIf(!hasMetadata)('every phone has valid formFactor', () => {
    for (const phone of phoneData) {
      expect(['bar', 'flip', 'fold']).toContain(
        (phone as { formFactor: string }).formFactor,
      );
    }
  });
});
