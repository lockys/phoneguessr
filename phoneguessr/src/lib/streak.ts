export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string | null;
  milestones: {
    day7: boolean;
    day30: boolean;
    day100: boolean;
  };
}

/**
 * Calculate updated streak after a game result.
 * Streak increments on win if the player won yesterday (consecutive days).
 * Streak resets to 0 on DNF, or 1 on win after a gap.
 */
export function updateStreak(
  current: StreakData,
  todayDate: string,
  won: boolean,
): StreakData {
  if (!won) {
    return {
      currentStreak: 0,
      bestStreak: current.bestStreak,
      lastPlayedDate: todayDate,
      milestones: current.milestones,
    };
  }

  const isConsecutive =
    current.lastPlayedDate !== null &&
    isNextDay(current.lastPlayedDate, todayDate);

  const newStreak = isConsecutive ? current.currentStreak + 1 : 1;
  const newBest = Math.max(newStreak, current.bestStreak);

  return {
    currentStreak: newStreak,
    bestStreak: newBest,
    lastPlayedDate: todayDate,
    milestones: {
      day7: current.milestones.day7 || newStreak >= 7,
      day30: current.milestones.day30 || newStreak >= 30,
      day100: current.milestones.day100 || newStreak >= 100,
    },
  };
}

/**
 * Check if dateB is exactly one day after dateA (UTC dates in YYYY-MM-DD format).
 */
export function isNextDay(dateA: string, dateB: string): boolean {
  const a = new Date(`${dateA}T00:00:00Z`);
  const b = new Date(`${dateB}T00:00:00Z`);
  const diffMs = b.getTime() - a.getTime();
  return diffMs === 24 * 60 * 60 * 1000;
}

/**
 * Check if a streak was broken (player missed at least one day).
 */
export function isStreakBroken(
  lastPlayedDate: string | null,
  todayDate: string,
): boolean {
  if (lastPlayedDate === null) return false;
  return !isNextDay(lastPlayedDate, todayDate) && lastPlayedDate !== todayDate;
}
