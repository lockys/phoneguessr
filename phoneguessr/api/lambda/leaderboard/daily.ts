import { IS_MOCK } from '../../../src/mock';
import { MOCK_LEADERBOARD_DAILY } from '../../../src/mock/data';

export const get = async () => {
  if (IS_MOCK) {
    return { entries: MOCK_LEADERBOARD_DAILY };
  }

  const { eq, asc, and } = await import('drizzle-orm');
  const { db } = await import('../../../src/db');
  const { results, users, dailyPuzzles } = await import('../../../src/db/schema');

  const today = new Date().toISOString().slice(0, 10);

  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.puzzleDate, today))
    .limit(1);

  if (!puzzle) {
    return { entries: [] };
  }

  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      score: results.score,
      guessCount: results.guessCount,
    })
    .from(results)
    .innerJoin(users, eq(results.userId, users.id))
    .where(and(eq(results.puzzleId, puzzle.id), eq(results.isWin, true)))
    .orderBy(asc(results.score))
    .limit(50);

  return {
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      score: e.score,
      guessCount: e.guessCount,
    })),
  };
};
