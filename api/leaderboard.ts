import { eq, and, sql, desc, gte, asc } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import { results, users, dailyPuzzles } from '../phoneguessr/src/db/schema.js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const period = url.searchParams.get('period');

  if (period === 'daily') {
    return getDailyLeaderboard();
  }

  const startDate = getStartDate(period);
  if (!startDate) {
    return Response.json({ error: 'Invalid period' }, { status: 400 });
  }

  return getAggregateLeaderboard(startDate);
}

async function getDailyLeaderboard() {
  const today = new Date().toISOString().slice(0, 10);

  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.puzzleDate, today))
    .limit(1);

  if (!puzzle) {
    return Response.json({ entries: [] });
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

  return Response.json({
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      score: e.score,
      guessCount: e.guessCount,
    })),
  });
}

function getStartDate(period: string | null): Date | null {
  const now = new Date();

  switch (period) {
    case 'weekly': {
      const day = now.getUTCDay();
      const diff = day === 0 ? 6 : day - 1;
      const monday = new Date(now);
      monday.setUTCDate(now.getUTCDate() - diff);
      monday.setUTCHours(0, 0, 0, 0);
      return monday;
    }
    case 'monthly':
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    case 'all-time':
      return new Date(0);
    default:
      return null;
  }
}

async function getAggregateLeaderboard(startDate: Date) {
  const whereClause =
    startDate.getTime() === 0
      ? eq(results.isWin, true)
      : and(eq(results.isWin, true), gte(results.createdAt, startDate));

  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalWins: sql<number>`count(*)`.as('total_wins'),
    })
    .from(results)
    .innerJoin(users, eq(results.userId, users.id))
    .where(whereClause)
    .groupBy(users.id, users.displayName, users.avatarUrl)
    .orderBy(desc(sql`total_wins`))
    .limit(50);

  return Response.json({
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      totalWins: e.totalWins,
    })),
  });
}
