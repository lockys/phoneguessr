import { and, asc, eq } from 'drizzle-orm';
import { db } from '../phoneguessr/src/db/index.js';
import { guesses, phones, results } from '../phoneguessr/src/db/schema.js';
import { COOKIE_NAME, verifySessionToken } from '../phoneguessr/src/lib/auth.js';
import { parseCookies } from '../phoneguessr/src/lib/cookies.js';
import {
  getTodayPuzzle,
  getYesterdayPuzzle,
} from '../phoneguessr/src/lib/puzzle.js';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'today': {
      try {
        const { puzzle } = await getTodayPuzzle();
        const base = {
          puzzleId: puzzle.id,
          puzzleNumber: puzzle.puzzleNumber,
          puzzleDate: puzzle.puzzleDate,
          imageUrl: '/api/puzzle/image',
        };

        // For authenticated users, embed today's game state so the frontend
        // knows immediately whether they already played (no race condition).
        const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
        if (token) {
          const session = await verifySessionToken(token);
          if (session) {
            const [userGuesses, resultRows] = await Promise.all([
              db
                .select({
                  phoneName: phones.brand,
                  phoneModel: phones.model,
                  feedback: guesses.feedback,
                })
                .from(guesses)
                .innerJoin(phones, eq(guesses.phoneId, phones.id))
                .where(
                  and(
                    eq(guesses.userId, session.userId),
                    eq(guesses.puzzleId, puzzle.id),
                  ),
                )
                .orderBy(asc(guesses.guessNumber)),
              db
                .select()
                .from(results)
                .where(
                  and(
                    eq(results.userId, session.userId),
                    eq(results.puzzleId, puzzle.id),
                  ),
                )
                .limit(1),
            ]);

            const [result] = resultRows;
            if (userGuesses.length > 0 || result) {
              return Response.json({
                ...base,
                state: {
                  guesses: userGuesses.map(g => ({
                    phoneName: `${g.phoneName} ${g.phoneModel}`,
                    feedback: g.feedback,
                  })),
                  elapsed: result?.elapsedSeconds ?? null,
                  won: result?.isWin ?? null,
                },
              });
            }
          }
        }

        return Response.json(base);
      } catch (err) {
        console.error('[puzzle/today]', err);
        return Response.json({ error: 'puzzle_unavailable' }, { status: 500 });
      }
    }

    case 'image': {
      try {
        const { phone } = await getTodayPuzzle();
        return Response.json({ imageUrl: phone.imageUrl });
      } catch (err) {
        console.error('[puzzle/image]', err);
        return Response.json({ error: 'puzzle_unavailable' }, { status: 500 });
      }
    }

    case 'yesterday': {
      try {
        const result = await getYesterdayPuzzle();
        return Response.json(result);
      } catch {
        return Response.json({ error: 'no_yesterday_puzzle' }, { status: 404 });
      }
    }

    case 'state': {
      const token = parseCookies(request.headers.get('cookie'))[COOKIE_NAME];
      if (!token) {
        return Response.json({ error: 'Not authenticated' }, { status: 401 });
      }
      const session = await verifySessionToken(token);
      if (!session) {
        return Response.json({ error: 'Invalid session' }, { status: 401 });
      }

      const { puzzle: todayPuzzle } = await getTodayPuzzle();

      const userGuesses = await db
        .select({
          phoneName: phones.brand,
          phoneModel: phones.model,
          feedback: guesses.feedback,
        })
        .from(guesses)
        .innerJoin(phones, eq(guesses.phoneId, phones.id))
        .where(
          and(
            eq(guesses.userId, session.userId),
            eq(guesses.puzzleId, todayPuzzle.id),
          ),
        )
        .orderBy(asc(guesses.guessNumber));

      const [result] = await db
        .select()
        .from(results)
        .where(
          and(
            eq(results.userId, session.userId),
            eq(results.puzzleId, todayPuzzle.id),
          ),
        )
        .limit(1);

      if (result) {
        return Response.json({
          guesses: userGuesses.map(g => ({
            phoneName: `${g.phoneName} ${g.phoneModel}`,
            feedback: g.feedback,
          })),
          elapsed: result.elapsedSeconds,
          won: result.isWin,
        });
      }

      if (userGuesses.length > 0) {
        return Response.json({
          guesses: userGuesses.map(g => ({
            phoneName: `${g.phoneName} ${g.phoneModel}`,
            feedback: g.feedback,
          })),
        });
      }

      return Response.json(null);
    }

    default:
      return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
