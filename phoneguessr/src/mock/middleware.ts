import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  MOCK_LEADERBOARD_AGGREGATE,
  MOCK_LEADERBOARD_DAILY,
  MOCK_PHONES,
  MOCK_USER,
} from './data.ts';
import {
  getMockFeedback,
  getMockHint,
  getMockProfileStats,
  getMockPuzzle,
  getMockYesterdayPuzzle,
  resetMockHints,
} from './state.ts';

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString()));
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function parseQuery(url: string): URLSearchParams {
  const idx = url.indexOf('?');
  return new URLSearchParams(idx >= 0 ? url.slice(idx + 1) : '');
}

const routes: Record<
  string,
  (
    req: IncomingMessage,
    res: ServerResponse,
    query: URLSearchParams,
  ) => Promise<void> | void
> = {
  'GET /api/puzzle/today': (_req, res) => {
    const puzzle = getMockPuzzle();
    json(res, {
      puzzleId: puzzle.puzzleId,
      puzzleNumber: puzzle.puzzleNumber,
      puzzleDate: puzzle.puzzleDate,
      imageUrl: '/api/puzzle/image',
      _mockAnswerId: puzzle._answerId,
      _mockAnswerBrand: puzzle._answerBrand,
    });
  },

  'GET /api/puzzle/image': (_req, res) => {
    const puzzle = getMockPuzzle();
    json(res, { imageUrl: puzzle.imageUrl });
  },

  'GET /api/puzzle/yesterday': (_req, res) => {
    json(res, getMockYesterdayPuzzle());
  },

  'GET /api/phones': (_req, res) => {
    json(res, {
      phones: MOCK_PHONES.map(p => ({
        id: p.id,
        brand: p.brand,
        model: p.model,
      })),
    });
  },

  'GET /api/leaderboard/daily': (_req, res) => {
    json(res, { entries: MOCK_LEADERBOARD_DAILY });
  },

  'GET /api/leaderboard/weekly': (_req, res) => {
    json(res, { entries: MOCK_LEADERBOARD_AGGREGATE });
  },

  'GET /api/leaderboard/monthly': (_req, res) => {
    json(res, { entries: MOCK_LEADERBOARD_AGGREGATE });
  },

  'GET /api/leaderboard/all-time': (_req, res) => {
    json(res, { entries: MOCK_LEADERBOARD_AGGREGATE });
  },

  'GET /api/auth/me': (_req, res) => {
    json(res, { user: MOCK_USER });
  },

  'GET /api/auth/login': (_req, res) => {
    res.writeHead(302, { Location: '/' });
    res.end();
  },

  'GET /api/auth/logout': (_req, res) => {
    res.writeHead(302, { Location: '/' });
    res.end();
  },

  'POST /api/guess': async (req, res) => {
    const body = await parseBody(req);
    const phoneId = body.phoneId as number;
    const feedback = getMockFeedback(phoneId);
    json(res, { feedback });
  },

  'POST /api/result': async (req, res) => {
    const body = await parseBody(req);
    const guessCount = (body.guessCount as number) || 1;
    const isWin = body.isWin as boolean;
    const elapsed = (body.elapsedSeconds as number) || 0;
    const wrongGuesses = isWin ? guessCount - 1 : guessCount;
    const score = isWin ? elapsed + wrongGuesses * 10 : null;
    json(res, { success: true, score });
  },

  'POST /api/hint': async (req, res) => {
    const body = await parseBody(req);
    const hintType = body.hintType as 'brand' | 'year' | 'price_tier';
    const result = getMockHint(hintType);
    if ('error' in result) {
      json(res, { error: result.error }, result.status);
      return;
    }
    json(res, result);
  },

  'GET /api/profile/stats': (_req, res) => {
    json(res, getMockProfileStats());
  },

  'GET /api/profile/history': (_req, res) => {
    json(res, { results: [], total: 0 });
  },

  'POST /api/profile/update': (_req, res) => {
    json(res, { success: true });
  },

};

export function mockApiMiddleware(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) {
  const url = req.url || '/';
  const pathname = url.split('?')[0];
  const method = req.method || 'GET';

  if (!pathname.startsWith('/api/')) {
    next();
    return;
  }

  const routeKey = `${method} ${pathname}`;
  const handler = routes[routeKey];

  if (!handler) {
    json(res, { error: 'Not found' }, 404);
    return;
  }

  const query = parseQuery(url);
  Promise.resolve(handler(req, res, query)).catch(err => {
    console.error('[mock-api]', err);
    json(res, { error: 'Internal server error' }, 500);
  });
}

/** Reset per-session state (hints) */
export function resetMockState() {
  resetMockHints();
}
