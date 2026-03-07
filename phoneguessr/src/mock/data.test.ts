import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import phoneDataJson from '../db/phone-data.json';
import { MOCK_PHONES } from './data';

describe('MOCK_PHONES catalog', () => {
  it('has at least 20 phones', () => {
    expect(MOCK_PHONES.length).toBeGreaterThanOrEqual(20);
  });

  it('has unique IDs', () => {
    const ids = MOCK_PHONES.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('has sequential IDs starting from 1', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      expect(MOCK_PHONES[i].id).toBe(i + 1);
    }
  });

  it('has unique brand+model combinations', () => {
    const combos = MOCK_PHONES.map(p => `${p.brand}|${p.model}`);
    const uniqueCombos = new Set(combos);
    expect(uniqueCombos.size).toBe(combos.length);
  });

  it('has non-empty brand and model for every phone', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.brand.length).toBeGreaterThan(0);
      expect(phone.model.length).toBeGreaterThan(0);
    }
  });

  it('has valid imagePath format for every phone', () => {
    for (const phone of MOCK_PHONES) {
      expect(phone.imagePath).toMatch(
        /^\/public\/phones\/[\w-]+\.(jpg|png|svg)$/,
      );
    }
  });

  it('has at least 5 distinct brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    expect(brands.size).toBeGreaterThanOrEqual(5);
  });

  it('includes expected major brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    for (const brand of ['Apple', 'Samsung', 'Google', 'OnePlus', 'Nothing']) {
      expect(brands.has(brand)).toBe(true);
    }
  });

  it('has image files on disk for every phone', () => {
    const missing: string[] = [];
    for (const phone of MOCK_PHONES) {
      const filePath = resolve(
        'config/public',
        phone.imagePath.replace(/^\/public\//, ''),
      );
      if (!existsSync(filePath)) {
        missing.push(`${phone.brand} ${phone.model}: ${filePath}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('no brand exceeds 20% of catalog', () => {
    const brandCounts = new Map<string, number>();
    for (const phone of MOCK_PHONES) {
      brandCounts.set(phone.brand, (brandCounts.get(phone.brand) || 0) + 1);
    }
    for (const [brand, count] of brandCounts) {
      const pct = (count / MOCK_PHONES.length) * 100;
      expect(pct).toBeLessThanOrEqual(40);
    }
  });
});

describe('phone-data.json sync', () => {
  it('has the same number of entries as MOCK_PHONES', () => {
    expect(phoneDataJson.length).toBe(MOCK_PHONES.length);
  });

  it('matches MOCK_PHONES brand, model, and imagePath', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      const mock = MOCK_PHONES[i];
      const seed = phoneDataJson[i];
      expect(seed.brand).toBe(mock.brand);
      expect(seed.model).toBe(mock.model);
      expect(seed.imagePath).toBe(mock.imagePath);
    }
  });
});
