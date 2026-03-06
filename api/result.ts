import { and, eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import { results } from '../phoneguessr/src/db/schema.js';
import { COOKIE_NAME, verifySessionToken } from '../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../phoneguessr/src/lib/cookies.js';

export async function POST(request: Request) {
  const body: {
    puzzleId: number;
    guessCount: number;
    isWin: boolean;
    elapsedSeconds: number;
  } = await request.json();

  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await db
    .select()
    .from(results)
    .where(
      and(eq(results.userId, session.userId), eq(results.puzzleId, body.puzzleId)),
    )
    .limit(1);

  if (existing.length > 0) {
    return Response.json({ error: 'Already submitted' }, { status: 409 });
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

  return Response.json({ success: true, score });
}
