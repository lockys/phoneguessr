import { useHonoContext } from '@modern-js/server-core';
import { IS_MOCK } from '../../src/mock/index.ts';
import { getMockHint } from '../../src/mock/state.ts';

const VALID_HINT_TYPES = ['brand', 'year', 'price_tier'] as const;
type HintType = (typeof VALID_HINT_TYPES)[number];

export const post = async () => {
  if (IS_MOCK) {
    // In mock mode, return brand hint (body can't be parsed without Hono context)
    const result = getMockHint('brand');
    if ('error' in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  }

  const c = useHonoContext();
  const body = await c.req.json<{ puzzleId: number; hintType: string }>();

  if (!VALID_HINT_TYPES.includes(body.hintType as HintType)) {
    return c.json({ error: 'invalid_hint_type' }, 400);
  }

  const { getCookie } = await import('hono/cookie');
  const { and, eq } = await import('drizzle-orm');
  const { db } = await import('../../src/db');
  const { hints, dailyPuzzles, phones, results } = await import(
    '../../src/db/schema'
  );
  const { COOKIE_NAME, verifySessionToken } = await import(
    '../../src/lib/auth'
  );

  const token = getCookie(c, COOKIE_NAME);
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Verify puzzle exists
  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.id, body.puzzleId))
    .limit(1);

  if (!puzzle) {
    return c.json({ error: 'Puzzle not found' }, 404);
  }

  // Check if puzzle already completed
  const [existingResult] = await db
    .select()
    .from(results)
    .where(
      and(
        eq(results.userId, session.userId),
        eq(results.puzzleId, body.puzzleId),
      ),
    )
    .limit(1);

  if (existingResult) {
    return c.json({ error: 'puzzle_completed' }, 409);
  }

  // Check existing hints for this user+puzzle
  const existingHints = await db
    .select()
    .from(hints)
    .where(
      and(eq(hints.userId, session.userId), eq(hints.puzzleId, body.puzzleId)),
    );

  if (existingHints.length >= 2) {
    return c.json({ error: 'max_hints_reached' }, 409);
  }

  if (existingHints.some(h => h.hintType === body.hintType)) {
    return c.json({ error: 'max_hints_reached' }, 409);
  }

  // Get the answer phone to retrieve hint data
  const [answerPhone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, puzzle.phoneId))
    .limit(1);

  const hintType = body.hintType as HintType;
  let hint: string;
  switch (hintType) {
    case 'brand':
      hint = answerPhone.brand;
      break;
    case 'year':
      hint = answerPhone.releaseYear
        ? String(answerPhone.releaseYear)
        : 'Unknown';
      break;
    case 'price_tier':
      hint = answerPhone.priceTier ?? 'Unknown';
      break;
  }

  // Record the hint
  await db.insert(hints).values({
    userId: session.userId,
    puzzleId: body.puzzleId,
    hintType: body.hintType,
  });

  const hintsUsed = existingHints.length + 1;

  return c.json({
    hint,
    penalty: 15,
    hintsUsed,
    hintsRemaining: 2 - hintsUsed,
  });
};
