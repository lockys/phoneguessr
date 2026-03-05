import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../src/mock/index.ts';

export const post = async () => {
  const c = useHonoContext();

  const body = await c.req.json<{
    puzzleId: number;
    guessCount: number;
    isWin: boolean;
    elapsedSeconds: number;
  }>();

  if (IS_MOCK) {
    const wrongGuesses = body.isWin ? body.guessCount - 1 : body.guessCount;
    const score = body.isWin ? body.elapsedSeconds + wrongGuesses * 10 : null;
    return c.json({ success: true, score });
  }

  const { getCookie } = await import('hono/cookie');
  const { and, eq } = await import('drizzle-orm');
  const { db } = await import('../../src/db');
  const { results } = await import('../../src/db/schema');
  const { COOKIE_NAME, verifySessionToken } = await import('../../src/lib/auth');

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const existing = await db
    .select()
    .from(results)
    .where(
      and(eq(results.userId, session.userId), eq(results.puzzleId, body.puzzleId)),
    )
    .limit(1);

  if (existing.length > 0) {
    return c.json({ error: 'Already submitted' }, 409);
  }

  const wrongGuesses = body.isWin ? body.guessCount - 1 : body.guessCount;
  const score = body.isWin ? body.elapsedSeconds + wrongGuesses * 10 : null;

  await db.insert(results).values({
    userId: session.userId,
    puzzleId: body.puzzleId,
    score,
    guessCount: body.guessCount,
    isWin: body.isWin,
    elapsedSeconds: body.elapsedSeconds,
  });

  return c.json({ success: true, score });
};
