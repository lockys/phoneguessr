import { describe, expect, it } from 'vitest';
import { isNextDay, isStreakBroken, updateStreak } from './streak';
import type { StreakData } from './streak';

const FRESH_STREAK: StreakData = {
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedDate: null,
  milestones: { day7: false, day30: false, day100: false },
};

describe('isNextDay', () => {
  it('consecutive days return true', () => {
    expect(isNextDay('2026-03-04', '2026-03-05')).toBe(true);
  });

  it('same day returns false', () => {
    expect(isNextDay('2026-03-05', '2026-03-05')).toBe(false);
  });

  it('two-day gap returns false', () => {
    expect(isNextDay('2026-03-03', '2026-03-05')).toBe(false);
  });

  it('month boundary works', () => {
    expect(isNextDay('2026-01-31', '2026-02-01')).toBe(true);
  });

  it('year boundary works', () => {
    expect(isNextDay('2025-12-31', '2026-01-01')).toBe(true);
  });
});

describe('isStreakBroken', () => {
  it('no previous play is not a break', () => {
    expect(isStreakBroken(null, '2026-03-05')).toBe(false);
  });

  it('consecutive day is not a break', () => {
    expect(isStreakBroken('2026-03-04', '2026-03-05')).toBe(false);
  });

  it('same day is not a break', () => {
    expect(isStreakBroken('2026-03-05', '2026-03-05')).toBe(false);
  });

  it('two-day gap is a break', () => {
    expect(isStreakBroken('2026-03-03', '2026-03-05')).toBe(true);
  });
});

describe('updateStreak', () => {
  it('first win starts streak at 1', () => {
    const result = updateStreak(FRESH_STREAK, '2026-03-05', true);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-03-05');
  });

  it('consecutive win increments streak', () => {
    const current: StreakData = {
      currentStreak: 5,
      bestStreak: 10,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: false, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', true);
    expect(result.currentStreak).toBe(6);
    expect(result.bestStreak).toBe(10);
  });

  it('DNF resets streak to 0', () => {
    const current: StreakData = {
      currentStreak: 10,
      bestStreak: 15,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: true, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', false);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(15);
    expect(result.milestones.day7).toBe(true);
  });

  it('win after gap starts streak at 1', () => {
    const current: StreakData = {
      currentStreak: 5,
      bestStreak: 5,
      lastPlayedDate: '2026-03-02',
      milestones: { day7: false, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', true);
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(5);
  });

  it('updates best streak when current exceeds it', () => {
    const current: StreakData = {
      currentStreak: 9,
      bestStreak: 9,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: true, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', true);
    expect(result.currentStreak).toBe(10);
    expect(result.bestStreak).toBe(10);
  });

  it('triggers 7-day milestone', () => {
    const current: StreakData = {
      currentStreak: 6,
      bestStreak: 6,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: false, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', true);
    expect(result.currentStreak).toBe(7);
    expect(result.milestones.day7).toBe(true);
    expect(result.milestones.day30).toBe(false);
  });

  it('triggers 30-day milestone', () => {
    const current: StreakData = {
      currentStreak: 29,
      bestStreak: 29,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: true, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', true);
    expect(result.milestones.day30).toBe(true);
  });

  it('milestones persist after streak break', () => {
    const current: StreakData = {
      currentStreak: 8,
      bestStreak: 8,
      lastPlayedDate: '2026-03-04',
      milestones: { day7: true, day30: false, day100: false },
    };
    const result = updateStreak(current, '2026-03-05', false);
    expect(result.currentStreak).toBe(0);
    expect(result.milestones.day7).toBe(true);
  });
});
