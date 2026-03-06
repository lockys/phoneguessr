import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../../src/mock/index.ts';
import { getMockProfileStats } from '../../../src/mock/state.ts';

export const get = async () => {
  if (IS_MOCK) {
    return Response.json(getMockProfileStats());
  }

  const c = useHonoContext();

  const { getCookie } = await import('hono/cookie');
  const { db } = await import('../../../src/db');
  const { results } = await import('../../../src/db/schema');
  const { eq, sql } = await import('drizzle-orm');
  const { COOKIE_NAME, verifySessionToken } = await import(
    '../../../src/lib/auth'
  );

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const rows = await db
    .select({
      gamesPlayed: sql<number>`count(*)`,
      wins: sql<number>`count(*) filter (where ${results.isWin} = true)`,
    })
    .from(results)
    .where(eq(results.userId, session.userId));

  const { gamesPlayed, wins } = rows[0] || { gamesPlayed: 0, wins: 0 };

  // Calculate streaks from ordered results
  const allResults = await db
    .select({ isWin: results.isWin })
    .from(results)
    .where(eq(results.userId, session.userId))
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
