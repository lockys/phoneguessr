import { describe, expect, it } from 'vitest';
import { calculateStreakFromDates, daysBetween } from './streak';

describe('daysBetween', () => {
  it('returns 0 for same date', () => {
    expect(daysBetween('2026-03-01', '2026-03-01')).toBe(0);
  });

  it('returns 1 for adjacent dates', () => {
    expect(daysBetween('2026-03-01', '2026-03-02')).toBe(1);
  });

  it('returns correct gap across months', () => {
    expect(daysBetween('2026-02-28', '2026-03-01')).toBe(1);
  });

  it('is commutative', () => {
    expect(daysBetween('2026-03-05', '2026-03-01')).toBe(4);
    expect(daysBetween('2026-03-01', '2026-03-05')).toBe(4);
  });
});

describe('calculateStreakFromDates', () => {
  const today = '2026-03-06';

  it('returns zeros for empty dates', () => {
    const result = calculateStreakFromDates([], today);
    expect(result).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      milestones: { '7day': false, '30day': false, '100day': false },
    });
  });

  it('returns streak of 1 when only today', () => {
    const result = calculateStreakFromDates(['2026-03-06'], today);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-03-06');
  });

  it('returns streak of 1 when only yesterday', () => {
    const result = calculateStreakFromDates(['2026-03-05'], today);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
  });

  it('counts consecutive days from most recent', () => {
    const dates = ['2026-03-06', '2026-03-05', '2026-03-04', '2026-03-03'];
    const result = calculateStreakFromDates(dates, today);
    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(4);
  });

  it('breaks current streak on gap but tracks best', () => {
    // 3-day streak ending today, then gap, then 5-day old streak
    const dates = [
      '2026-03-06',
      '2026-03-05',
      '2026-03-04',
      // gap on 03-03
      '2026-03-02',
      '2026-03-01',
      '2026-02-28',
      '2026-02-27',
      '2026-02-26',
    ];
    const result = calculateStreakFromDates(dates, today);
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(5);
  });

  it('current streak is 0 if last win was more than 1 day ago', () => {
    const dates = ['2026-03-03', '2026-03-02', '2026-03-01'];
    const result = calculateStreakFromDates(dates, today);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(3);
    expect(result.lastPlayedDate).toBe('2026-03-03');
  });

  it('sets 7day milestone when best streak >= 7', () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date('2026-03-06T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const result = calculateStreakFromDates(dates, today);
    expect(result.milestones['7day']).toBe(true);
    expect(result.milestones['30day']).toBe(false);
    expect(result.milestones['100day']).toBe(false);
  });

  it('sets 30day milestone when best streak >= 30', () => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date('2026-03-06T00:00:00Z');
      d.setUTCDate(d.getUTCDate() - i);
      return d.toISOString().slice(0, 10);
    });
    const result = calculateStreakFromDates(dates, today);
    expect(result.milestones['7day']).toBe(true);
    expect(result.milestones['30day']).toBe(true);
    expect(result.milestones['100day']).toBe(false);
  });

  it('handles single old win correctly', () => {
    const result = calculateStreakFromDates(['2026-01-15'], today);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-01-15');
  });

  it('handles yesterday start correctly', () => {
    const dates = ['2026-03-05', '2026-03-04'];
    const result = calculateStreakFromDates(dates, today);
    expect(result.currentStreak).toBe(2);
    expect(result.bestStreak).toBe(2);
  });
});
