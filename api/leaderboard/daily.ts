import { eq, asc, and } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db';
import { results, users, dailyPuzzles } from '../../phoneguessr/src/db/schema';

export async function GET() {
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
