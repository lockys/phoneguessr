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

  it('has image files on disk for phones from phone-data.json', () => {
    // Only check images that are in phone-data.json (real catalog)
    const missing: string[] = [];
    for (const phone of phoneDataJson) {
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

  it('no brand exceeds 40% of catalog', () => {
    const brandCounts = new Map<string, number>();
    for (const phone of MOCK_PHONES) {
      brandCounts.set(phone.brand, (brandCounts.get(phone.brand) || 0) + 1);
    }
    for (const [, count] of brandCounts) {
      const pct = (count / MOCK_PHONES.length) * 100;
      expect(pct).toBeLessThanOrEqual(40);
    }
  });
});

describe('difficulty distribution', () => {
  it('has all three difficulty tiers represented', () => {
    const difficulties = new Set(MOCK_PHONES.map(p => p.difficulty));
    expect(difficulties.has('easy')).toBe(true);
    expect(difficulties.has('medium')).toBe(true);
    expect(difficulties.has('hard')).toBe(true);
  });

  it('Nothing Phone is classified as hard', () => {
    const nothingPhones = MOCK_PHONES.filter(p => p.brand === 'Nothing');
    for (const phone of nothingPhones) {
      expect(phone.difficulty).toBe('hard');
    }
  });

  it('Apple phones are classified as easy', () => {
    const applePhones = MOCK_PHONES.filter(p => p.brand === 'Apple');
    for (const phone of applePhones) {
      expect(phone.difficulty).toBe('easy');
    }
  });

  it('Samsung phones are classified as easy', () => {
    const samsungPhones = MOCK_PHONES.filter(p => p.brand === 'Samsung');
    for (const phone of samsungPhones) {
      expect(phone.difficulty).toBe('easy');
    }
  });
});

describe('phone-data.json sync', () => {
  it('phone-data.json has at least 20 entries', () => {
    expect(phoneDataJson.length).toBeGreaterThanOrEqual(20);
  });

  it('all phone-data.json entries are represented in MOCK_PHONES', () => {
    const mockKeys = new Set(MOCK_PHONES.map(p => `${p.brand}|${p.model}`));
    const missing: string[] = [];
    for (const phone of phoneDataJson) {
      const key = `${phone.brand}|${phone.model}`;
      if (!mockKeys.has(key)) {
        missing.push(key);
      }
    }
    expect(missing).toEqual([]);
  });

  it('difficulty matches for phones present in both', () => {
    const mockMap = new Map(
      MOCK_PHONES.map(p => [`${p.brand}|${p.model}`, p]),
    );
    for (const phone of phoneDataJson) {
      const key = `${phone.brand}|${phone.model}`;
      const mock = mockMap.get(key);
      if (mock) {
        expect(phone.difficulty).toBe(mock.difficulty);
      }
    }
  });
});
