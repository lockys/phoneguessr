import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getLocalStreakData } from './streak';

// Mock localStorage
const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  key: (index: number) => Object.keys(storage)[index] ?? null,
  get length() {
    return Object.keys(storage).length;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  clear: () => {
    for (const k of Object.keys(storage)) delete storage[k];
  },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

function setGame(date: string, won = true) {
  storage[`phoneguessr_${date}`] = JSON.stringify({
    guesses: [],
    elapsed: 30,
    won,
  });
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

describe('getLocalStreakData', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('returns zeros when no games played', () => {
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.bestStreak).toBe(0);
    expect(data.lastPlayedDate).toBeNull();
    expect(data.streakBroken).toBe(false);
    expect(data.milestones).toEqual({
      '7day': false,
      '30day': false,
      '100day': false,
    });
  });

  it('counts a single game today as streak of 1', () => {
    setGame(today());
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(1);
    expect(data.bestStreak).toBe(1);
    expect(data.lastPlayedDate).toBe(today());
    expect(data.streakBroken).toBe(false);
  });

  it('counts consecutive days as streak', () => {
    setGame(today());
    setGame(daysAgo(1));
    setGame(daysAgo(2));
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(3);
    expect(data.bestStreak).toBe(3);
  });

  it('breaks current streak with gap', () => {
    setGame(today());
    // skip daysAgo(1)
    setGame(daysAgo(2));
    setGame(daysAgo(3));
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(1);
    expect(data.bestStreak).toBe(2);
  });

  it('detects streak broken when last played >1 day ago', () => {
    setGame(daysAgo(3));
    setGame(daysAgo(4));
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(0);
    expect(data.streakBroken).toBe(true);
  });

  it('counts yesterday as current if no game today', () => {
    setGame(daysAgo(1));
    setGame(daysAgo(2));
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(2);
    expect(data.streakBroken).toBe(false);
  });

  it('computes milestones based on best streak', () => {
    // Create a 7-day streak
    for (let i = 0; i < 7; i++) {
      setGame(daysAgo(i));
    }
    const data = getLocalStreakData();
    expect(data.bestStreak).toBe(7);
    expect(data.milestones['7day']).toBe(true);
    expect(data.milestones['30day']).toBe(false);
    expect(data.milestones['100day']).toBe(false);
  });

  it('ignores non-phoneguessr keys in localStorage', () => {
    storage.other_key = 'value';
    setGame(today());
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(1);
  });

  it('includes losses in streak count (consecutive days played)', () => {
    setGame(today(), false);
    setGame(daysAgo(1), true);
    setGame(daysAgo(2), false);
    const data = getLocalStreakData();
    expect(data.currentStreak).toBe(3);
  });
});
