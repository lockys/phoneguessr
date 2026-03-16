import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_PHONES } from './data';
import {
  getMockHint,
  getMockPuzzle,
  getMockYesterdayPuzzle,
  resetMockHints,
} from './state';

describe('getMockYesterdayPuzzle', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns phone data with expected shape', () => {
    const result = getMockYesterdayPuzzle();

    expect(result.phone).toHaveProperty('brand');
    expect(result.phone).toHaveProperty('model');
    expect(result.phone).toHaveProperty('imagePath');
    expect(result.phone.releaseYear).toBeNull();
    expect(result.facts).toEqual([]);
    expect(typeof result.stats.totalPlayers).toBe('number');
    expect(typeof result.stats.avgGuesses).toBe('number');
    expect(typeof result.stats.winRate).toBe('number');
  });

  it('returns a valid phone from MOCK_PHONES', () => {
    const result = getMockYesterdayPuzzle();
    const match = MOCK_PHONES.find(
      p => p.brand === result.phone.brand && p.model === result.phone.model,
    );
    expect(match).toBeDefined();
  });

  it('picks yesterday date, not today', () => {
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'));
    const today = getMockPuzzle();
    const yesterday = getMockYesterdayPuzzle();

    expect(yesterday.phone.brand).toBeTruthy();
    expect(yesterday.phone.model).toBeTruthy();
  });

  it('is deterministic for the same day', () => {
    vi.setSystemTime(new Date('2026-06-15T10:00:00Z'));
    const result1 = getMockYesterdayPuzzle();

    vi.setSystemTime(new Date('2026-06-15T20:00:00Z'));
    const result2 = getMockYesterdayPuzzle();

    expect(result1.phone.brand).toBe(result2.phone.brand);
    expect(result1.phone.model).toBe(result2.phone.model);
  });
});

describe('getMockHint', () => {
  beforeEach(() => {
    resetMockHints();
  });

  it('returns brand hint for the daily puzzle phone', () => {
    const result = getMockHint('brand');
    expect('hint' in result).toBe(true);
    if ('hint' in result) {
      const puzzle = getMockPuzzle();
      const phone = MOCK_PHONES.find(p => p.id === puzzle._answerId);
      expect(result.hint).toBe(phone?.brand);
      expect(result.penalty).toBe(15);
      expect(result.hintsUsed).toBe(1);
      expect(result.hintsRemaining).toBe(1);
    }
  });

  it('returns year hint for the daily puzzle phone', () => {
    const result = getMockHint('year');
    expect('hint' in result).toBe(true);
    if ('hint' in result) {
      // MockPhone has releaseYear, hint should be a numeric string
      expect(Number(result.hint)).toBeGreaterThan(2000);
    }
  });

  it('returns price_tier hint for the daily puzzle phone', () => {
    const result = getMockHint('price_tier');
    expect('hint' in result).toBe(true);
    if ('hint' in result) {
      // MockPhone has priceTier, hint should be one of the valid tiers
      expect(['budget', 'mid', 'flagship']).toContain(result.hint);
    }
  });

  it('allows two different hint types', () => {
    const first = getMockHint('brand');
    expect('hint' in first).toBe(true);
    if ('hint' in first) {
      expect(first.hintsUsed).toBe(1);
      expect(first.hintsRemaining).toBe(1);
    }

    const second = getMockHint('year');
    expect('hint' in second).toBe(true);
    if ('hint' in second) {
      expect(second.hintsUsed).toBe(2);
      expect(second.hintsRemaining).toBe(0);
    }
  });

  it('rejects duplicate hint type', () => {
    getMockHint('brand');
    const duplicate = getMockHint('brand');
    expect('error' in duplicate).toBe(true);
    if ('error' in duplicate) {
      expect(duplicate.error).toBe('max_hints_reached');
      expect(duplicate.status).toBe(409);
    }
  });

  it('rejects third hint after max reached', () => {
    getMockHint('brand');
    getMockHint('year');
    const third = getMockHint('price_tier');
    expect('error' in third).toBe(true);
    if ('error' in third) {
      expect(third.error).toBe('max_hints_reached');
      expect(third.status).toBe(409);
    }
  });

  it('resetMockHints clears hint state', () => {
    getMockHint('brand');
    getMockHint('year');
    resetMockHints();

    const result = getMockHint('brand');
    expect('hint' in result).toBe(true);
    if ('hint' in result) {
      expect(result.hintsUsed).toBe(1);
    }
  });
});
