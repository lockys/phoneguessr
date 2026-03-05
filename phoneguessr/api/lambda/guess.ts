import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../src/mock/index.ts';
import { getMockFeedback } from '../../src/mock/state.ts';

export const post = async () => {
  if (IS_MOCK) {
    return Response.json({ feedback: 'wrong_brand' });
  }

  const c = useHonoContext();
  const body = await c.req.json<{
    puzzleId: number;
    phoneId: number;
    guessNumber: number;
  }>();

  const { eq } = await import('drizzle-orm');
  const { db } = await import('../../src/db');
  const { phones, dailyPuzzles, guesses } = await import('../../src/db/schema');
  const { getCookie } = await import('hono/cookie');
  const { COOKIE_NAME, verifySessionToken } = await import('../../src/lib/auth');

  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.id, body.puzzleId))
    .limit(1);

  if (!puzzle) {
    return c.json({ error: 'Puzzle not found' }, 404);
  }

  const [guessedPhone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, body.phoneId))
    .limit(1);

  if (!guessedPhone) {
    return c.json({ error: 'Phone not found' }, 404);
  }

  const [answerPhone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, puzzle.phoneId))
    .limit(1);

  let feedback: string;
  if (guessedPhone.id === answerPhone.id) {
    feedback = 'correct';
  } else if (guessedPhone.brand === answerPhone.brand) {
    feedback = 'right_brand';
  } else {
    feedback = 'wrong_brand';
  }

  const token = getCookie(c, COOKIE_NAME);
  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      await db.insert(guesses).values({
        userId: session.userId,
        puzzleId: body.puzzleId,
        phoneId: body.phoneId,
        guessNumber: body.guessNumber,
        feedback,
      });
    }
  }

  return c.json({ feedback });
};
