import { describe, expect, it } from 'vitest';
import { COUNTRY_CODES, COUNTRY_LIST, countryCodeToFlag } from './region';

describe('countryCodeToFlag', () => {
  it('converts TW to Taiwan flag', () => {
    expect(countryCodeToFlag('TW')).toBe('🇹🇼');
  });

  it('converts US to US flag', () => {
    expect(countryCodeToFlag('US')).toBe('🇺🇸');
  });

  it('converts JP to Japan flag', () => {
    expect(countryCodeToFlag('JP')).toBe('🇯🇵');
  });

  it('lowercases input correctly', () => {
    expect(countryCodeToFlag('tw')).toBe('🇹🇼');
  });

  it('returns empty string for null', () => {
    expect(countryCodeToFlag(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(countryCodeToFlag(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(countryCodeToFlag('')).toBe('');
  });

  it('returns empty string for 3-letter code', () => {
    expect(countryCodeToFlag('USA')).toBe('');
  });
});

describe('COUNTRY_LIST', () => {
  it('is sorted alphabetically by name', () => {
    expect(COUNTRY_LIST[0].name < COUNTRY_LIST[1].name).toBe(true);
  });

  it('contains Taiwan', () => {
    expect(COUNTRY_LIST.some(c => c.code === 'TW')).toBe(true);
  });

  it('contains United States', () => {
    expect(COUNTRY_LIST.some(c => c.code === 'US')).toBe(true);
  });

  it('all codes are 2 uppercase letters', () => {
    for (const c of COUNTRY_LIST) {
      expect(c.code).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('COUNTRY_CODES', () => {
  it('is derived from COUNTRY_LIST', () => {
    expect(COUNTRY_CODES).toEqual(COUNTRY_LIST.map(c => c.code));
  });

  it('contains TW', () => {
    expect(COUNTRY_CODES.includes('TW')).toBe(true);
  });
});
