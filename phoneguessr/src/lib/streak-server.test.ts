import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateStreakFromDates, getTodayUTC } from './streak';

describe('getTodayUTC', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns YYYY-MM-DD format', () => {
    const result = getTodayUTC();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns the correct date', () => {
    vi.setSystemTime(new Date('2026-06-15T10:00:00Z'));
    expect(getTodayUTC()).toBe('2026-06-15');
  });
});

describe('calculateStreakFromDates', () => {
  it('returns zeros for empty dates', () => {
    const result = calculateStreakFromDates([], '2026-03-06');
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.lastPlayedDate).toBeNull();
    expect(result.milestones).toEqual({
      '7day': false,
      '30day': false,
      '100day': false,
    });
  });

  it('counts single win today as streak of 1', () => {
    const result = calculateStreakFromDates(['2026-03-06'], '2026-03-06');
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-03-06');
  });

  it('counts consecutive days as streak', () => {
    const dates = ['2026-03-06', '2026-03-05', '2026-03-04'];
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
  });

  it('breaks current streak on gap', () => {
    const dates = ['2026-03-06', '2026-03-04', '2026-03-03'];
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(2);
  });

  it('counts yesterday as current if no game today', () => {
    const dates = ['2026-03-05', '2026-03-04'];
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.currentStreak).toBe(2);
  });

  it('returns zero current streak if last played >1 day ago', () => {
    const dates = ['2026-03-03', '2026-03-02'];
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(2);
  });

  it('computes milestones based on best streak', () => {
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date('2026-03-06');
      d.setUTCDate(d.getUTCDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.bestStreak).toBe(7);
    expect(result.milestones['7day']).toBe(true);
    expect(result.milestones['30day']).toBe(false);
  });

  it('finds best streak in historical data even if current is shorter', () => {
    const dates = [
      '2026-03-06',
      // gap
      '2026-03-01',
      '2026-02-28',
      '2026-02-27',
      '2026-02-26',
    ];
    const result = calculateStreakFromDates(dates, '2026-03-06');
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(4);
  });
});
