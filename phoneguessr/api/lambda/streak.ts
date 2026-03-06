import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../src/mock/index.ts';
import { getMockStreak } from '../../src/mock/state.ts';

export const get = async () => {
  if (IS_MOCK) {
    return Response.json(getMockStreak());
  }

  const c = useHonoContext();

  const { getCookie } = await import('hono/cookie');
  const { eq, sql, desc } = await import('drizzle-orm');
  const { db } = await import('../../src/db');
  const { results, dailyPuzzles } = await import('../../src/db/schema');
  const { COOKIE_NAME, verifySessionToken } = await import(
    '../../src/lib/auth'
  );
  const { calculateStreakFromDates, getTodayUTC } = await import(
    '../../src/lib/streak'
  );

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      milestones: { '7day': false, '30day': false, '100day': false },
    });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedDate: null,
      milestones: { '7day': false, '30day': false, '100day': false },
    });
  }

  // Get distinct winning puzzle dates, sorted descending
  const winRows = await db
    .selectDistinct({ puzzleDate: dailyPuzzles.puzzleDate })
    .from(results)
    .innerJoin(dailyPuzzles, eq(results.puzzleId, dailyPuzzles.id))
    .where(
      sql`${results.userId} = ${session.userId} AND ${results.isWin} = true`,
    )
    .orderBy(desc(dailyPuzzles.puzzleDate));

  const winDates = winRows.map(r => r.puzzleDate);
  const streak = calculateStreakFromDates(winDates, getTodayUTC());

  return c.json(streak);
};
