// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockDb } from '../src/test/mock-db.js';

const mockDb = createMockDb();
vi.mock('../src/db/index.js', () => ({ db: mockDb }));

const mockVerifySessionToken = vi.fn();
vi.mock('../src/lib/auth.js', () => ({
  COOKIE_NAME: 'phoneguessr_session',
  verifySessionToken: mockVerifySessionToken,
}));

const { POST } = await import('../../api/profile.js');

const SESSION = { userId: 1, googleId: 'g1', displayName: 'Test' };

function makeReq(body: object) {
  return new Request('http://localhost/api/profile/update', {
    method: 'POST',
    headers: {
      cookie: 'phoneguessr_session=valid',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/profile — region field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.reset();
    mockVerifySessionToken.mockResolvedValue(SESSION);
  });

  it('returns 401 when not authenticated', async () => {
    mockVerifySessionToken.mockResolvedValueOnce(null);
    const res = await POST(makeReq({ region: 'TW' }));
    expect(res.status).toBe(401);
  });

  it('saves valid region code', async () => {
    mockDb.mockQuery([]); // db.update returns empty (no .returning())
    const res = await POST(makeReq({ region: 'TW' }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('normalizes region code to uppercase before saving', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: 'tw' }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('clears region when null is sent', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: null }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('clears region when empty string is sent', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ region: '' }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });

  it('returns 400 for invalid region code', async () => {
    const res = await POST(makeReq({ region: 'XX' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/region/i);
  });

  it('returns 400 for 3-letter code', async () => {
    const res = await POST(makeReq({ region: 'USA' }));
    expect(res.status).toBe(400);
  });

  it('no-op success when body is empty object', async () => {
    const res = await POST(makeReq({}));
    expect(res.status).toBe(200);
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  it('saves both displayName and region together', async () => {
    mockDb.mockQuery([]);
    const res = await POST(makeReq({ displayName: 'NewName', region: 'JP' }));
    expect(res.status).toBe(200);
    expect(mockDb.update).toHaveBeenCalledOnce();
  });
});
