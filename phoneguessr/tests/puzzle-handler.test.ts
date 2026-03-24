// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from '../src/test/mock-db.js';

const mockDb = createMockDb();

vi.mock('../src/db/index.js', () => ({ db: mockDb }));

const mockGetTodayPuzzle = vi.fn();
const mockGetYesterdayPuzzle = vi.fn();
vi.mock('../src/lib/puzzle.js', () => ({
  getTodayPuzzle: mockGetTodayPuzzle,
  getYesterdayPuzzle: mockGetYesterdayPuzzle,
}));

const mockVerifySessionToken = vi.fn();
vi.mock('../src/lib/auth.js', () => ({
  COOKIE_NAME: 'phoneguessr_session',
  verifySessionToken: mockVerifySessionToken,
}));

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();
vi.mock('node:fs', () => ({
  default: {
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
  },
}));

const { GET } = await import('../../api/puzzle.js');

const PUZZLE = {
  id: 42,
  puzzleNumber: 7,
  puzzleDate: '2026-03-10',
  phoneId: 5,
};
const PHONE = {
  id: 5,
  brand: 'Apple',
  model: 'iPhone 16 Pro',
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/commons/apple-iphone-16-pro.jpg',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockDb.reset();
});

describe('GET /api/puzzle?action=today', () => {
  it('returns puzzle metadata', async () => {
    mockGetTodayPuzzle.mockResolvedValue({ puzzle: PUZZLE, phone: PHONE });

    const res = await GET(
      new Request('http://localhost/api/puzzle?action=today'),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      puzzleId: 42,
      puzzleNumber: 7,
      puzzleDate: '2026-03-10',
      imageUrl: '/api/puzzle/image',
    });
  });
});

describe('GET /api/puzzle?action=image', () => {
  it('returns imageUrl directly from phone record', async () => {
    mockGetTodayPuzzle.mockResolvedValue({ puzzle: PUZZLE, phone: PHONE });

    const res = await GET(
      new Request('http://localhost/api/puzzle?action=image'),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ imageUrl: PHONE.imageUrl });
  });
});

describe('GET /api/puzzle?action=yesterday', () => {
  it('returns yesterday puzzle with stats', async () => {
    const yesterdayData = {
      phone: {
        brand: 'Samsung',
        model: 'Galaxy S24',
        imagePath: '/public/phones/samsung.png',
        releaseYear: null,
      },
      facts: [],
      stats: { totalPlayers: 50, avgGuesses: 3.2, winRate: 72 },
    };
    mockGetYesterdayPuzzle.mockResolvedValue(yesterdayData);

    const res = await GET(
      new Request('http://localhost/api/puzzle?action=yesterday'),
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.phone.brand).toBe('Samsung');
    expect(body.stats.totalPlayers).toBe(50);
  });

  it('returns 404 when no yesterday puzzle', async () => {
    mockGetYesterdayPuzzle.mockRejectedValue(new Error('no puzzle'));

    const res = await GET(
      new Request('http://localhost/api/puzzle?action=yesterday'),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('no_yesterday_puzzle');
  });
});

describe('GET /api/puzzle?action=state', () => {
  const SESSION = { userId: 1, googleId: 'g1', displayName: 'Test' };

  function stateRequest(cookie?: string) {
    const headers: HeadersInit = {};
    if (cookie) headers.cookie = cookie;
    return new Request('http://localhost/api/puzzle?action=state', { headers });
  }

  it('returns 401 without session cookie', async () => {
    const res = await GET(stateRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 with invalid token', async () => {
    mockVerifySessionToken.mockResolvedValue(null);

    const res = await GET(stateRequest('phoneguessr_session=bad-token'));
    expect(res.status).toBe(401);
  });

  it('returns null when no guesses', async () => {
    mockVerifySessionToken.mockResolvedValue(SESSION);
    mockGetTodayPuzzle.mockResolvedValue({ puzzle: PUZZLE, phone: PHONE });
    mockDb.mockQuery([], []);

    const res = await GET(stateRequest('phoneguessr_session=valid'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toBeNull();
  });

  it('returns in-progress guesses', async () => {
    mockVerifySessionToken.mockResolvedValue(SESSION);
    mockGetTodayPuzzle.mockResolvedValue({ puzzle: PUZZLE, phone: PHONE });
    const guessRows = [
      {
        phoneName: 'Samsung',
        phoneModel: 'Galaxy S24',
        feedback: 'wrong_brand',
      },
    ];
    mockDb.mockQuery(guessRows, []);

    const res = await GET(stateRequest('phoneguessr_session=valid'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.guesses).toHaveLength(1);
    expect(body.guesses[0]).toEqual({
      phoneName: 'Samsung Galaxy S24',
      feedback: 'wrong_brand',
    });
    expect(body.elapsed).toBeUndefined();
    expect(body.won).toBeUndefined();
  });

  it('returns completed state with elapsed and won', async () => {
    mockVerifySessionToken.mockResolvedValue(SESSION);
    mockGetTodayPuzzle.mockResolvedValue({ puzzle: PUZZLE, phone: PHONE });
    const guessRows = [
      {
        phoneName: 'Samsung',
        phoneModel: 'Galaxy S24',
        feedback: 'wrong_brand',
      },
      { phoneName: 'Apple', phoneModel: 'iPhone 16 Pro', feedback: 'correct' },
    ];
    const resultRow = [{ isWin: true, elapsedSeconds: 32 }];
    mockDb.mockQuery(guessRows, resultRow);

    const res = await GET(stateRequest('phoneguessr_session=valid'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.guesses).toHaveLength(2);
    expect(body.elapsed).toBe(32);
    expect(body.won).toBe(true);
  });
});

describe('GET /api/puzzle with invalid action', () => {
  it('returns 404 for unknown action', async () => {
    const res = await GET(
      new Request('http://localhost/api/puzzle?action=bogus'),
    );
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Not found');
  });

  it('returns 404 when action is missing', async () => {
    const res = await GET(new Request('http://localhost/api/puzzle'));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('Not found');
  });
});
