import { and, eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db';
import {
  hints,
  dailyPuzzles,
  phones,
  results,
} from '../phoneguessr/src/db/schema';
import {
  COOKIE_NAME,
  verifySessionToken,
} from '../phoneguessr/src/lib/auth';
import { parseCookies } from '../phoneguessr/src/lib/cookies';

const VALID_HINT_TYPES = ['brand', 'year', 'price_tier'] as const;
type HintType = (typeof VALID_HINT_TYPES)[number];

export async function POST(request: Request) {
  const body: { puzzleId: number; hintType: string } = await request.json();

  if (!VALID_HINT_TYPES.includes(body.hintType as HintType)) {
    return Response.json({ error: 'invalid_hint_type' }, { status: 400 });
  }

  const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify puzzle exists
  const [puzzle] = await db
    .select()
    .from(dailyPuzzles)
    .where(eq(dailyPuzzles.id, body.puzzleId))
    .limit(1);

  if (!puzzle) {
    return Response.json({ error: 'Puzzle not found' }, { status: 404 });
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
    return Response.json({ error: 'puzzle_completed' }, { status: 409 });
  }

  // Check existing hints for this user+puzzle
  const existingHints = await db
    .select()
    .from(hints)
    .where(
      and(
        eq(hints.userId, session.userId),
        eq(hints.puzzleId, body.puzzleId),
      ),
    );

  if (existingHints.length >= 2) {
    return Response.json({ error: 'max_hints_reached' }, { status: 409 });
  }

  if (existingHints.some(h => h.hintType === body.hintType)) {
    return Response.json({ error: 'max_hints_reached' }, { status: 409 });
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

  return Response.json({
    hint,
    penalty: 15,
    hintsUsed,
    hintsRemaining: 2 - hintsUsed,
  });
}
