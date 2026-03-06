export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null;
  milestones: {
    '7day': boolean;
    '30day': boolean;
    '100day': boolean;
  };
}

/**
 * Calculate streak data from an array of winning puzzle dates (UTC, YYYY-MM-DD format).
 * Dates must be distinct and sorted descending (most recent first).
 * Current streak only counts if the most recent win is today or yesterday.
 */
export function calculateStreakFromDates(
  winDates: string[],
  todayUTC: string,
): StreakData {
  const empty: StreakData = {
    currentStreak: 0,
    bestStreak: 0,
    lastPlayedDate: null,
    milestones: { '7day': false, '30day': false, '100day': false },
  };

  if (winDates.length === 0) return empty;

  const lastPlayedDate = winDates[0];

  // Check if current streak is still active
  const daysSinceLast = daysBetween(lastPlayedDate, todayUTC);
  const isActive = daysSinceLast <= 1;

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 1;

  // Walk through dates, counting consecutive days
  for (let i = 1; i < winDates.length; i++) {
    const gap = daysBetween(winDates[i], winDates[i - 1]);
    if (gap === 1) {
      streak++;
    } else {
      bestStreak = Math.max(bestStreak, streak);
      streak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, streak);

  // Current streak: the streak starting from the most recent date, only if active
  if (isActive) {
    currentStreak = 1;
    for (let i = 1; i < winDates.length; i++) {
      const gap = daysBetween(winDates[i], winDates[i - 1]);
      if (gap === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    lastPlayedDate,
    milestones: {
      '7day': bestStreak >= 7,
      '30day': bestStreak >= 30,
      '100day': bestStreak >= 100,
    },
  };
}

/** Number of days between two YYYY-MM-DD date strings. Always positive. */
export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00Z`);
  const b = new Date(`${dateB}T00:00:00Z`);
  return Math.round(Math.abs(b.getTime() - a.getTime()) / 86400000);
}

/** Get today's date in UTC as YYYY-MM-DD */
export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}
