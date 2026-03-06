export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null;
  milestones: {
    '7day': boolean;
    '30day': boolean;
    '100day': boolean;
  };
  streakBroken: boolean;
}

/**
 * Parse a YYYY-MM-DD string into a Date at midnight UTC.
 */
function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Get today's date as YYYY-MM-DD string.
 */
function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Get today's UTC date as YYYY-MM-DD string (exported for server use).
 */
export function getTodayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculate streak data from an array of winning puzzle dates (descending order).
 * Used by the server-side streak endpoint.
 */
export function calculateStreakFromDates(
  winDates: string[],
  today: string,
): Omit<StreakData, 'streakBroken'> {
  if (winDates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      milestones: { '7day': false, '30day': false, '100day': false },
    };
  }

  const lastPlayedDate = winDates[0];
  const todayMs = parseDate(today).getTime();
  const lastMs = parseDate(lastPlayedDate).getTime();
  const daysSinceLast = Math.round((todayMs - lastMs) / 86400000);

  // Current streak: count consecutive days backwards from today (or yesterday)
  let currentStreak = 0;
  if (daysSinceLast <= 1) {
    const dateSet = new Set(winDates);
    let checkDate = daysSinceLast === 0 ? today : lastPlayedDate;
    while (dateSet.has(checkDate)) {
      currentStreak++;
      const prev = parseDate(checkDate);
      prev.setUTCDate(prev.getUTCDate() - 1);
      checkDate = prev.toISOString().slice(0, 10);
    }
  }

  // Best streak: longest consecutive day run across all dates
  let bestStreak = 0;
  let streak = 1;
  for (let i = 1; i < winDates.length; i++) {
    const curr = parseDate(winDates[i - 1]);
    const prev = parseDate(winDates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      bestStreak = Math.max(bestStreak, streak);
      streak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, streak, currentStreak);

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

/**
 * Compute streak data from localStorage game results.
 * Streaks count consecutive days played (any result counts).
 */
export function getLocalStreakData(): StreakData {
  const dates: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('phoneguessr_')) continue;
    const date = key.replace('phoneguessr_', '');
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      dates.push(date);
    }
  }

  dates.sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      milestones: { '7day': false, '30day': false, '100day': false },
      streakBroken: false,
    };
  }

  const lastPlayedDate = dates[0];
  const today = getTodayStr();
  const todayMs = parseDate(today).getTime();
  const lastMs = parseDate(lastPlayedDate).getTime();
  const daysSinceLast = Math.round((todayMs - lastMs) / 86400000);

  // Current streak: count consecutive days backwards from today (or yesterday)
  let currentStreak = 0;
  if (daysSinceLast <= 1) {
    // Started playing today or yesterday - count the run
    const dateSet = new Set(dates);
    let checkDate = daysSinceLast === 0 ? today : lastPlayedDate;
    while (dateSet.has(checkDate)) {
      currentStreak++;
      const prev = parseDate(checkDate);
      prev.setUTCDate(prev.getUTCDate() - 1);
      checkDate = prev.toISOString().slice(0, 10);
    }
  }

  // Best streak: longest consecutive day run across all dates
  let bestStreak = 0;
  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = parseDate(dates[i - 1]);
    const prev = parseDate(dates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      bestStreak = Math.max(bestStreak, streak);
      streak = 1;
    }
  }
  bestStreak = Math.max(bestStreak, streak, currentStreak);

  // Streak broken: had a streak but missed more than 1 day
  const streakBroken = daysSinceLast > 1 && dates.length > 0;

  return {
    currentStreak,
    bestStreak,
    lastPlayedDate,
    milestones: {
      '7day': bestStreak >= 7,
      '30day': bestStreak >= 30,
      '100day': bestStreak >= 100,
    },
    streakBroken,
  };
}
