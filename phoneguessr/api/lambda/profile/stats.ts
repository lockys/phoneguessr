import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock';
import { getMockProfileStats } from '../../../src/mock/state';

export const get = async () => {
  const c = useHonoContext();

  if (IS_MOCK) {
    return c.json(getMockProfileStats());
  }

  const { getDb } = await import('../../../src/db');
  const { results } = await import('../../../src/db/schema');
  const { eq, sql } = await import('drizzle-orm');

  // Get user from auth cookie
  const { verifySession } = await import('../../../src/lib/auth');
  const user = await verifySession(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const db = getDb();
  const rows = await db
    .select({
      gamesPlayed: sql<number>`count(*)`,
      wins: sql<number>`count(*) filter (where ${results.isWin} = true)`,
    })
    .from(results)
    .where(eq(results.userId, user.id));

  const { gamesPlayed, wins } = rows[0] || { gamesPlayed: 0, wins: 0 };

  // Calculate streaks from ordered results
  const allResults = await db
    .select({ isWin: results.isWin })
    .from(results)
    .where(eq(results.userId, user.id))
    .orderBy(sql`${results.createdAt} desc`);

  let currentStreak = 0;
  let bestStreak = 0;
  let streak = 0;

  for (const r of allResults) {
    if (r.isWin) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      if (currentStreak === 0) currentStreak = streak;
      streak = 0;
    }
  }
  if (currentStreak === 0) currentStreak = streak;
  bestStreak = Math.max(bestStreak, streak);

  return c.json({
    gamesPlayed,
    wins,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    currentStreak,
    bestStreak,
  });
};
