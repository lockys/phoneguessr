import { and, eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import { phones, dailyPuzzles, guesses, results } from '../phoneguessr/src/db/schema.js';
import { COOKIE_NAME, verifySessionToken } from '../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../phoneguessr/src/lib/cookies.js';

export async function POST(request: Request) {
  const body: { puzzleId: number; phoneId: number; guessNumber: number } =
    await request.json();

  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.id, body.puzzleId))
    .limit(1);

  if (!puzzle) {
    return Response.json({ error: 'Puzzle not found' }, { status: 404 });
  }

  const [guessedPhone] = await db
    .select()
    .from(phones)
    .where(eq(phones.id, body.phoneId))
    .limit(1);

  if (!guessedPhone) {
    return Response.json({ error: 'Phone not found' }, { status: 404 });
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

  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      // Block replay: reject if user already completed today's puzzle
      const [existing] = await db
        .select()
        .from(results)
        .where(
          and(
            eq(results.userId, session.userId),
            eq(results.puzzleId, body.puzzleId),
          ),
        )
        .limit(1);
      if (existing) {
        return Response.json({ error: 'Already played today' }, { status: 409 });
      }

      await db.insert(guesses).values({
        userId: session.userId,
        puzzleId: body.puzzleId,
        phoneId: body.phoneId,
        guessNumber: body.guessNumber,
        feedback,
      });
    }
  }

  return Response.json({ feedback });
}
