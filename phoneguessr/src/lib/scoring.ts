/**
 * Calculate game score: elapsed_seconds + (wrong_guesses × 10) + (hints_used × 15)
 * Lower is better. DNF returns null.
 */
export function calculateScore(
  elapsedSeconds: number,
  wrongGuesses: number,
  hintsUsed: number,
): number {
  return elapsedSeconds + wrongGuesses * 10 + hintsUsed * 15;
}

export interface ScoreBreakdown {
  time: number;
  guessPenalty: number;
  hintPenalty: number;
  total: number;
}

export function getScoreBreakdown(
  elapsedSeconds: number,
  wrongGuesses: number,
  hintsUsed: number,
): ScoreBreakdown {
  const time = elapsedSeconds;
  const guessPenalty = wrongGuesses * 10;
  const hintPenalty = hintsUsed * 15;
  return {
    time,
    guessPenalty,
    hintPenalty,
    total: time + guessPenalty + hintPenalty,
  };
}
