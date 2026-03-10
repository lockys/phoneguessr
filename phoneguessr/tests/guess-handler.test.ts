// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from '../src/test/mock-db';

const mockDb = createMockDb();

vi.mock('../src/db/index.js', () => ({ db: mockDb }));

// Mock auth — default: no session
const mockVerify = vi
  .fn<() => Promise<null | { userId: number }>>()
  .mockResolvedValue(null);
vi.mock('../src/lib/auth.js', () => ({
  COOKIE_NAME: 'phoneguessr_session',
  verifySessionToken: (...args: unknown[]) => mockVerify(...(args as [])),
}));

// Import handler after mocks are registered
const { POST } = await import('../../api/guess.js');

function makeRequest(
  body: { puzzleId: number; phoneId: number; guessNumber: number },
  cookie?: string,
) {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  return new Request('http://localhost/api/guess', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

const puzzle = {
  id: 1,
  phoneId: 10,
  puzzleDate: '2026-03-10',
  puzzleNumber: 42,
};
const applePhone = { id: 10, brand: 'Apple', model: 'iPhone 16' };
const samsungPhone = { id: 20, brand: 'Samsung', model: 'Galaxy S25' };
const appleOther = { id: 11, brand: 'Apple', model: 'iPhone 15' };

describe('POST /api/guess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
    mockVerify.mockResolvedValue(null);
  });

  describe('feedback', () => {
    it('returns "correct" when guessed phone matches answer', async () => {
      mockDb.mockQuery([puzzle], [applePhone], [applePhone]);
      const res = await POST(
        makeRequest({ puzzleId: 1, phoneId: 10, guessNumber: 1 }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ feedback: 'correct' });
    });

    it('returns "right_brand" when brand matches but phone differs', async () => {
      mockDb.mockQuery([puzzle], [appleOther], [applePhone]);
      const res = await POST(
        makeRequest({ puzzleId: 1, phoneId: 11, guessNumber: 2 }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ feedback: 'right_brand' });
    });

    it('returns "wrong_brand" when brand does not match', async () => {
      mockDb.mockQuery([puzzle], [samsungPhone], [applePhone]);
      const res = await POST(
        makeRequest({ puzzleId: 1, phoneId: 20, guessNumber: 3 }),
      );
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ feedback: 'wrong_brand' });
    });
  });

  describe('404 errors', () => {
    it('returns 404 when puzzle is not found', async () => {
      mockDb.mockQuery([]);
      const res = await POST(
        makeRequest({ puzzleId: 999, phoneId: 10, guessNumber: 1 }),
      );
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Puzzle not found' });
    });

    it('returns 404 when guessed phone is not found', async () => {
      mockDb.mockQuery([puzzle], []);
      const res = await POST(
        makeRequest({ puzzleId: 1, phoneId: 999, guessNumber: 1 }),
      );
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: 'Phone not found' });
    });
  });

  describe('auth saving', () => {
    it('saves guess to database for authenticated user', async () => {
      mockVerify.mockResolvedValue({ userId: 7 });
      mockDb.mockQuery([puzzle], [samsungPhone], [applePhone], []);
      const res = await POST(
        makeRequest(
          { puzzleId: 1, phoneId: 20, guessNumber: 2 },
          'phoneguessr_session=valid-token',
        ),
      );
      expect(res.status).toBe(200);
      expect(mockDb.insert).toHaveBeenCalledOnce();
    });

    it('does not save guess when no cookie is present', async () => {
      mockDb.mockQuery([puzzle], [applePhone], [applePhone]);
      const res = await POST(
        makeRequest({ puzzleId: 1, phoneId: 10, guessNumber: 1 }),
      );
      expect(res.status).toBe(200);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('does not save guess when session token is invalid', async () => {
      mockVerify.mockResolvedValue(null);
      mockDb.mockQuery([puzzle], [applePhone], [applePhone]);
      const res = await POST(
        makeRequest(
          { puzzleId: 1, phoneId: 10, guessNumber: 1 },
          'phoneguessr_session=bad-token',
        ),
      );
      expect(res.status).toBe(200);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });
});
