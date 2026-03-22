import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ManifestEntry } from '../scripts/collect-images';
import {
  inferFormFactor,
  inferPriceTier,
  loadManifest,
  phaseGenerate,
  toKebabSlug,
} from '../scripts/collect-images';

describe('toKebabSlug', () => {
  it('converts brand + model to kebab-case', () => {
    expect(toKebabSlug('Apple', 'iPhone 16 Pro Max')).toBe('apple-iphone-16-pro-max');
    expect(toKebabSlug('Samsung', 'Galaxy S25 Ultra')).toBe('samsung-galaxy-s25-ultra');
    expect(toKebabSlug('Nothing', 'Phone 2')).toBe('nothing-phone-2');
  });

  it('collapses multiple non-alphanumeric chars', () => {
    expect(toKebabSlug('Sony Ericsson', 'W995')).toBe('sony-ericsson-w995');
  });

  it('strips leading and trailing hyphens', () => {
    const slug = toKebabSlug('Test', '!Phone!');
    expect(slug).not.toMatch(/^-|-$/);
  });
});

describe('inferPriceTier', () => {
  it('returns flagship for Pro/Ultra/Max models', () => {
    expect(inferPriceTier('Apple', 'iPhone 16 Pro Max')).toBe('flagship');
    expect(inferPriceTier('Samsung', 'Galaxy S25 Ultra')).toBe('flagship');
    expect(inferPriceTier('Google', 'Pixel 9 Pro')).toBe('flagship');
  });

  it('returns budget for budget brand names', () => {
    expect(inferPriceTier('Tecno', 'Spark 20')).toBe('budget');
    expect(inferPriceTier('Infinix', 'Hot 30')).toBe('budget');
  });

  it('returns mid as default', () => {
    expect(inferPriceTier('Nokia', 'G42 5G')).toBe('mid');
  });
});

describe('inferFormFactor', () => {
  it('identifies flip phones', () => {
    expect(inferFormFactor('Galaxy Z Flip 6')).toBe('flip');
    expect(inferFormFactor('Razr 50 Ultra')).toBe('flip');
  });

  it('identifies fold phones', () => {
    expect(inferFormFactor('Galaxy Z Fold 6')).toBe('fold');
    expect(inferFormFactor('Pixel 9 Pro Fold')).toBe('fold');
  });

  it('defaults to bar', () => {
    expect(inferFormFactor('iPhone 16 Pro')).toBe('bar');
    expect(inferFormFactor('Galaxy S25 Ultra')).toBe('bar');
  });
});

describe('loadManifest', () => {
  it('loads all entries when no brand filter', () => {
    const entries = loadManifest(null);
    expect(entries.length).toBeGreaterThan(0);
  });

  it('filters by brand (case-insensitive)', () => {
    const entries = loadManifest('apple');
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e.brand.toLowerCase()).toBe('apple');
    }
  });

  it('returns empty array for unknown brand', () => {
    const entries = loadManifest('UnknownBrandXYZ');
    expect(entries).toHaveLength(0);
  });

  it('every entry has required fields', () => {
    const entries = loadManifest(null);
    for (const e of entries) {
      expect(typeof e.brand).toBe('string');
      expect(typeof e.model).toBe('string');
      expect(typeof e.imageUrl).toBe('string');
      expect(e.imageUrl).toMatch(/^https?:\/\//);
      expect(typeof e.releaseYear).toBe('number');
      expect(['budget', 'mid', 'flagship']).toContain(e.priceTier);
      expect(['bar', 'flip', 'fold']).toContain(e.formFactor);
      expect(['easy', 'medium', 'hard']).toContain(e.difficulty);
      expect(typeof e.source).toBe('string');
    }
  });

  it('has no duplicate brand+model entries', () => {
    const entries = loadManifest(null);
    const keys = entries.map(e => `${e.brand}|${e.model}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

describe('phaseGenerate', () => {
  it('skips entries without a processed image file', () => {
    const entries: ManifestEntry[] = [
      {
        brand: 'TestBrand',
        model: 'Model That Does Not Exist',
        imageUrl: 'https://example.com/img.jpg',
        releaseYear: 2024,
        priceTier: 'mid',
        formFactor: 'bar',
        difficulty: 'hard',
        source: 'test',
      },
    ];
    const result = phaseGenerate(entries);
    // Should not crash and should not add entries without images
    const added = result.find(p => p.brand === 'TestBrand');
    expect(added).toBeUndefined();
  });

  it('preserves existing phone-data.json entries', () => {
    // Run with an empty manifest — existing entries should come through
    const result = phaseGenerate([]);
    expect(result.length).toBeGreaterThan(0);
    const hasApple = result.some(p => p.brand === 'Apple');
    expect(hasApple).toBe(true);
  });
});
