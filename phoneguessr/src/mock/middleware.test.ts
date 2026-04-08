import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { beforeEach, describe, expect, it } from 'vitest';
import { MOCK_PHONES } from './data';
import { mockApiMiddleware, resetMockState } from './middleware';

function createReq(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): IncomingMessage {
  const req = new EventEmitter() as IncomingMessage;
  req.method = method;
  req.url = url;
  req.headers = { host: 'localhost:8080' };

  if (body) {
    const data = JSON.stringify(body);
    process.nextTick(() => {
      req.emit('data', Buffer.from(data));
      req.emit('end');
    });
  } else {
    process.nextTick(() => req.emit('end'));
  }

  return req;
}

function createRes(): ServerResponse & {
  _status: number;
  _headers: Record<string, string>;
  _body: string;
} {
  const res = {
    _status: 200,
    _headers: {} as Record<string, string>,
    _body: '',
    writeHead(status: number, headers?: Record<string, string>) {
      res._status = status;
      if (headers) Object.assign(res._headers, headers);
    },
    end(body?: string) {
      if (body) res._body = body;
    },
  } as unknown as ServerResponse & {
    _status: number;
    _headers: Record<string, string>;
    _body: string;
  };
  return res;
}

function parseBody(res: ReturnType<typeof createRes>) {
  return JSON.parse(res._body);
}

async function callMiddleware(
  method: string,
  url: string,
  body?: Record<string, unknown>,
): Promise<ReturnType<typeof createRes>> {
  const req = createReq(method, url, body);
  const res = createRes();
  await new Promise<void>(resolve => {
    mockApiMiddleware(req, res as unknown as ServerResponse, () => {
      resolve();
    });
    // For routes that handle the request, wait for the response
    const check = () => {
      if (res._body) resolve();
      else setTimeout(check, 10);
    };
    setTimeout(check, 10);
  });
  return res;
}

describe('mockApiMiddleware', () => {
  beforeEach(() => {
    resetMockState();
  });

  it('passes through non-API requests', async () => {
    const req = createReq('GET', '/');
    const res = createRes();
    let nextCalled = false;
    mockApiMiddleware(req, res as unknown as ServerResponse, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(res._body).toBe('');
  });

  describe('GET /api/puzzle/today', () => {
    it('returns puzzle data with mock answer fields', async () => {
      const res = await callMiddleware('GET', '/api/puzzle/today');
      const data = parseBody(res);
      expect(data).toHaveProperty('puzzleId');
      expect(data).toHaveProperty('puzzleNumber');
      expect(data).toHaveProperty('puzzleDate');
      expect(data).toHaveProperty('imageUrl', '/api/puzzle/image');
      expect(data).toHaveProperty('_mockAnswerId');
      expect(data).toHaveProperty('_mockAnswerBrand');
      expect(typeof data._mockAnswerId).toBe('number');
      expect(typeof data._mockAnswerBrand).toBe('string');
    });
  });

  describe('GET /api/puzzle/image', () => {
    it('returns imageUrl from Wikimedia CDN', async () => {
      const res = await callMiddleware('GET', '/api/puzzle/image');
      const data = parseBody(res);
      expect(data).toHaveProperty('imageUrl');
      expect(data.imageUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('GET /api/puzzle/yesterday', () => {
    it('returns yesterday puzzle with stats', async () => {
      const res = await callMiddleware('GET', '/api/puzzle/yesterday');
      const data = parseBody(res);
      expect(data.phone).toHaveProperty('brand');
      expect(data.phone).toHaveProperty('model');
      expect(data.stats).toHaveProperty('totalPlayers');
      expect(data.stats).toHaveProperty('avgGuesses');
      expect(data.stats).toHaveProperty('winRate');
    });
  });

  describe('GET /api/phones', () => {
    it('returns phones with correct shape', async () => {
      const res = await callMiddleware('GET', '/api/phones');
      const data = parseBody(res);
      expect(data.phones.length).toBeGreaterThanOrEqual(20);
      expect(data.phones[0]).toHaveProperty('id');
      expect(data.phones[0]).toHaveProperty('brand');
      expect(data.phones[0]).toHaveProperty('model');
    });
  });

  describe('GET /api/leaderboard/:period', () => {
    it('returns daily leaderboard entries', async () => {
      const res = await callMiddleware('GET', '/api/leaderboard/daily');
      const data = parseBody(res);
      expect(data.entries.length).toBeGreaterThan(0);
      expect(data.entries[0]).toHaveProperty('rank');
      expect(data.entries[0]).toHaveProperty('displayName');
      expect(data.entries[0]).toHaveProperty('score');
      expect(data.entries[0]).toHaveProperty('guessCount');
    });

    it('returns aggregate leaderboard for weekly', async () => {
      const res = await callMiddleware('GET', '/api/leaderboard/weekly');
      const data = parseBody(res);
      expect(data.entries.length).toBeGreaterThan(0);
      expect(data.entries[0]).toHaveProperty('totalWins');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns mock user', async () => {
      const res = await callMiddleware('GET', '/api/auth/me');
      const data = parseBody(res);
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('displayName');
    });
  });

  describe('GET /api/auth/login', () => {
    it('redirects to /', async () => {
      const req = createReq('GET', '/api/auth/login');
      const res = createRes();
      mockApiMiddleware(req, res as unknown as ServerResponse, () => {});
      await new Promise(r => setTimeout(r, 50));
      expect(res._status).toBe(302);
      expect(res._headers.Location).toBe('/');
    });
  });

  describe('POST /api/guess', () => {
    it('returns correct feedback for matching phone', async () => {
      // Get today's puzzle answer first
      const puzzleRes = await callMiddleware('GET', '/api/puzzle/today');
      const puzzle = parseBody(puzzleRes);

      const res = await callMiddleware('POST', '/api/guess', {
        puzzleId: 1,
        phoneId: puzzle._mockAnswerId,
        guessNumber: 1,
      });
      const data = parseBody(res);
      expect(data.feedback).toBe('correct');
    });

    it('returns wrong_brand for different brand', async () => {
      const puzzleRes = await callMiddleware('GET', '/api/puzzle/today');
      const puzzle = parseBody(puzzleRes);
      // Find a phone with a different brand
      const wrongPhone = MOCK_PHONES.find(
        p => p.brand !== puzzle._mockAnswerBrand,
      );
      if (!wrongPhone) return;

      const res = await callMiddleware('POST', '/api/guess', {
        puzzleId: 1,
        phoneId: wrongPhone.id,
        guessNumber: 1,
      });
      const data = parseBody(res);
      expect(data.feedback).toBe('wrong_brand');
    });

    it('returns right_brand for same brand different model', async () => {
      const puzzleRes = await callMiddleware('GET', '/api/puzzle/today');
      const puzzle = parseBody(puzzleRes);
      // Find a different phone with the same brand
      const sameBrand = MOCK_PHONES.find(
        p =>
          p.brand === puzzle._mockAnswerBrand && p.id !== puzzle._mockAnswerId,
      );
      if (!sameBrand) return; // Skip if no other phone in same brand

      const res = await callMiddleware('POST', '/api/guess', {
        puzzleId: 1,
        phoneId: sameBrand.id,
        guessNumber: 1,
      });
      const data = parseBody(res);
      expect(data.feedback).toBe('right_brand');
    });
  });

  describe('POST /api/result', () => {
    it('returns success with calculated score', async () => {
      const res = await callMiddleware('POST', '/api/result', {
        puzzleId: 1,
        guessCount: 3,
        isWin: true,
        elapsedSeconds: 25,
      });
      const data = parseBody(res);
      expect(data.success).toBe(true);
      expect(data.score).toBe(45); // 25 + (3-1)*10
    });

    it('returns null score for loss', async () => {
      const res = await callMiddleware('POST', '/api/result', {
        puzzleId: 1,
        guessCount: 6,
        isWin: false,
        elapsedSeconds: 120,
      });
      const data = parseBody(res);
      expect(data.success).toBe(true);
      expect(data.score).toBeNull();
    });
  });

  describe('POST /api/hint', () => {
    it('returns brand hint', async () => {
      const res = await callMiddleware('POST', '/api/hint', {
        puzzleId: 1,
        hintType: 'brand',
      });
      const data = parseBody(res);
      expect(data).toHaveProperty('hint');
      expect(data.penalty).toBe(15);
      expect(data.hintsUsed).toBe(1);
      expect(data.hintsRemaining).toBe(1);
    });

    it('returns max_hints_reached after 2 hints', async () => {
      await callMiddleware('POST', '/api/hint', {
        puzzleId: 1,
        hintType: 'brand',
      });
      await callMiddleware('POST', '/api/hint', {
        puzzleId: 1,
        hintType: 'year',
      });
      const res = await callMiddleware('POST', '/api/hint', {
        puzzleId: 1,
        hintType: 'price_tier',
      });
      const data = parseBody(res);
      expect(res._status).toBe(409);
      expect(data.error).toBe('max_hints_reached');
    });
  });

  describe('GET /api/profile/stats', () => {
    it('returns mock profile stats', async () => {
      const res = await callMiddleware('GET', '/api/profile/stats');
      const data = parseBody(res);
      expect(data).toHaveProperty('gamesPlayed');
      expect(data).toHaveProperty('wins');
      expect(data).toHaveProperty('winRate');
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('bestStreak');
    });
  });

  describe('POST /api/profile/update', () => {
    it('returns success', async () => {
      const res = await callMiddleware('POST', '/api/profile/update', {
        displayName: 'NewName',
      });
      const data = parseBody(res);
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/auth/passkey/register-options', () => {
    it('returns WebAuthn registration options', async () => {
      const res = await callMiddleware(
        'GET',
        '/api/auth/passkey/register-options',
      );
      const data = parseBody(res);
      expect(res._status).toBe(200);
      expect(data).toHaveProperty('challenge');
      expect(data).toHaveProperty('rp');
      expect(data.rp).toHaveProperty('name');
      expect(data.rp).toHaveProperty('id');
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('pubKeyCredParams');
      expect(Array.isArray(data.pubKeyCredParams)).toBe(true);
    });
  });

  describe('POST /api/auth/passkey/register', () => {
    it('returns success true', async () => {
      const res = await callMiddleware('POST', '/api/auth/passkey/register', {
        id: 'mock-credential-id',
        rawId: 'mock-raw-id',
        type: 'public-key',
      });
      const data = parseBody(res);
      expect(res._status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/auth/passkey/login-options', () => {
    it('returns WebAuthn authentication options', async () => {
      const res = await callMiddleware(
        'POST',
        '/api/auth/passkey/login-options',
        {},
      );
      const data = parseBody(res);
      expect(res._status).toBe(200);
      expect(data).toHaveProperty('challenge');
      expect(data).toHaveProperty('rpId');
      expect(data).toHaveProperty('allowCredentials');
      expect(Array.isArray(data.allowCredentials)).toBe(true);
    });
  });

  describe('POST /api/auth/passkey/login', () => {
    it('returns verified true with mock user', async () => {
      const res = await callMiddleware('POST', '/api/auth/passkey/login', {
        id: 'mock-credential-id',
        rawId: 'mock-raw-id',
        type: 'public-key',
      });
      const data = parseBody(res);
      expect(res._status).toBe(200);
      expect(data.verified).toBe(true);
      expect(data.user).toHaveProperty('id');
      expect(data.user).toHaveProperty('displayName');
    });
  });

  describe('unknown API routes', () => {
    it('returns 404 for unknown path', async () => {
      const req = createReq('GET', '/api/unknown');
      const res = createRes();
      mockApiMiddleware(req, res as unknown as ServerResponse, () => {});
      await new Promise(r => setTimeout(r, 50));
      expect(res._status).toBe(404);
    });
  });
});
