import { IS_MOCK } from '../../../src/mock/index.ts';
import { MOCK_LEADERBOARD_AGGREGATE } from '../../../src/mock/data.ts';

export const get = async () => {
  if (IS_MOCK) {
    return { entries: MOCK_LEADERBOARD_AGGREGATE };
  }

  const { eq, sql, desc, gte } = await import('drizzle-orm');
  const { db } = await import('../../../src/db');
  const { results, users } = await import('../../../src/db/schema');

  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  const entries = await db
    .select({
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      totalWins: sql<number>`count(*)`.as('total_wins'),
    })
    .from(results)
    .innerJoin(users, eq(results.userId, users.id))
    .where(eq(results.isWin, true))
    .where(gte(results.createdAt, monthStart))
    .groupBy(users.id, users.displayName, users.avatarUrl)
    .orderBy(desc(sql`total_wins`))
    .limit(50);

  return {
    entries: entries.map((e, i) => ({
      rank: i + 1,
      displayName: e.displayName,
      avatarUrl: e.avatarUrl,
      totalWins: e.totalWins,
    })),
  };
};
