import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { MOCK_PHONES } from './data.ts';

// Also validate phone-data.json stays in sync
import phoneDataJson from '../db/phone-data.json' with { type: 'json' };

describe('MOCK_PHONES catalog', () => {
  it('has at least 100 phones', () => {
    assert.ok(
      MOCK_PHONES.length >= 100,
      `Expected at least 100 phones, got ${MOCK_PHONES.length}`,
    );
  });

  it('has unique IDs', () => {
    const ids = MOCK_PHONES.map(p => p.id);
    const uniqueIds = new Set(ids);
    assert.equal(uniqueIds.size, ids.length, 'Duplicate IDs found');
  });

  it('has sequential IDs starting from 1', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      assert.equal(MOCK_PHONES[i].id, i + 1, `Phone at index ${i} should have id ${i + 1}`);
    }
  });

  it('has unique brand+model combinations', () => {
    const combos = MOCK_PHONES.map(p => `${p.brand}|${p.model}`);
    const uniqueCombos = new Set(combos);
    assert.equal(uniqueCombos.size, combos.length, 'Duplicate brand+model combinations found');
  });

  it('has non-empty brand and model for every phone', () => {
    for (const phone of MOCK_PHONES) {
      assert.ok(phone.brand.length > 0, `Phone id=${phone.id} has empty brand`);
      assert.ok(phone.model.length > 0, `Phone id=${phone.id} has empty model`);
    }
  });

  it('has valid imagePath format for every phone', () => {
    for (const phone of MOCK_PHONES) {
      assert.match(
        phone.imagePath,
        /^\/public\/phones\/[\w-]+\.(jpg|png|svg)$/,
        `Phone id=${phone.id} has invalid imagePath: ${phone.imagePath}`,
      );
    }
  });

  it('has at least 10 distinct brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    assert.ok(
      brands.size >= 10,
      `Expected at least 10 brands, got ${brands.size}: ${[...brands].join(', ')}`,
    );
  });

  it('includes expected major brands', () => {
    const brands = new Set(MOCK_PHONES.map(p => p.brand));
    const expectedBrands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'];
    for (const brand of expectedBrands) {
      assert.ok(brands.has(brand), `Missing expected brand: ${brand}`);
    }
  });

  it('has SVG placeholder files for phones with .svg paths', () => {
    const svgPhones = MOCK_PHONES.filter(p => p.imagePath.endsWith('.svg'));
    assert.ok(svgPhones.length > 0, 'No SVG phones found');

    for (const phone of svgPhones) {
      const filePath = resolve('config/public', phone.imagePath.replace(/^\/public\//, ''));
      assert.ok(
        existsSync(filePath),
        `Missing SVG placeholder for ${phone.brand} ${phone.model}: ${filePath}`,
      );
    }
  });
});

describe('phone-data.json sync', () => {
  it('has the same number of entries as MOCK_PHONES', () => {
    assert.equal(
      phoneDataJson.length,
      MOCK_PHONES.length,
      `phone-data.json has ${phoneDataJson.length} entries but MOCK_PHONES has ${MOCK_PHONES.length}`,
    );
  });

  it('matches MOCK_PHONES brand, model, and imagePath', () => {
    for (let i = 0; i < MOCK_PHONES.length; i++) {
      const mock = MOCK_PHONES[i];
      const seed = phoneDataJson[i];
      assert.equal(seed.brand, mock.brand, `Mismatch at index ${i}: brand`);
      assert.equal(seed.model, mock.model, `Mismatch at index ${i}: model`);
      assert.equal(seed.imagePath, mock.imagePath, `Mismatch at index ${i}: imagePath`);
    }
  });
});
