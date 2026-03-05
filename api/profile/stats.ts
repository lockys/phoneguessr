import { eq, sql } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db';
import { results } from '../../phoneguessr/src/db/schema';
import { COOKIE_NAME, verifySessionToken } from '../../phoneguessr/src/lib/auth';
import { parseCookies } from '../../phoneguessr/src/lib/cookies';

export async function GET(request: Request) {
  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select({
      gamesPlayed: sql<number>`count(*)`,
      wins: sql<number>`count(*) filter (where ${results.isWin} = true)`,
    })
    .from(results)
    .where(eq(results.userId, session.userId));

  const { gamesPlayed, wins } = rows[0] || { gamesPlayed: 0, wins: 0 };

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

  return Response.json({
    gamesPlayed,
    wins,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    currentStreak,
    bestStreak,
  });
}
