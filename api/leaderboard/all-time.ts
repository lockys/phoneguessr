import { eq, sql, desc } from 'drizzle-orm';
import { db } from '../../phoneguessr/src/db';
import { results, users } from '../../phoneguessr/src/db/schema';

export async function GET() {
  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalWins: sql<number>`count(*)`.as('total_wins'),
    })
    .from(results)
    .innerJoin(users, eq(results.userId, users.id))
    .where(eq(results.isWin, true))
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
