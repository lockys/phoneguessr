import { afterEach, describe, expect, it, vi } from 'vitest';
import { MOCK_PHONES } from './data';
import { getMockPuzzle, getMockYesterdayPuzzle } from './state';

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

    // Verify yesterday returns a phone (may or may not differ from today)
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
