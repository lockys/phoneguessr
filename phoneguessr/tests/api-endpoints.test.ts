// @vitest-environment node

import { describe, expect, it } from 'vitest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function api(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, init);
}

function postJson(path: string, body: unknown) {
  return api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('API Endpoints', () => {
  describe('GET /api/phones', () => {
    it('returns 120 phones with id, brand, model', async () => {
      const res = await api('/api/phones');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.phones).toBeInstanceOf(Array);
      expect(data.phones.length).toBe(120);
      expect(data.phones[0]).toHaveProperty('id');
      expect(data.phones[0]).toHaveProperty('brand');
      expect(data.phones[0]).toHaveProperty('model');
    });
  });

  describe('GET /api/puzzle/today', () => {
    it('returns puzzle data with puzzleId, puzzleNumber, puzzleDate, imageUrl', async () => {
      const res = await api('/api/puzzle/today');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('puzzleId');
      expect(data).toHaveProperty('puzzleNumber');
      expect(data).toHaveProperty('puzzleDate');
      expect(data).toHaveProperty('imageUrl');
      expect(typeof data.puzzleId).toBe('number');
      expect(typeof data.puzzleNumber).toBe('number');
      expect(data.imageUrl).toBe('/api/puzzle/image');
    });
  });

  describe('GET /api/puzzle/image', () => {
    it('returns base64 image data', async () => {
      const res = await api('/api/puzzle/image');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('imageData');
      expect(data.imageData).toMatch(
        /^data:image\/(png|jpeg|svg\+xml);base64,/,
      );
    });
  });

  describe('GET /api/puzzle/yesterday', () => {
    it('returns puzzle data or null', async () => {
      const res = await api('/api/puzzle/yesterday');
      expect(res.status).toBe(200);
      const data = await res.json();
      if (data !== null) {
        expect(data).toHaveProperty('phone');
        expect(data.phone).toHaveProperty('brand');
        expect(data.phone).toHaveProperty('model');
      }
    });
  });

  describe('GET /api/leaderboard/daily', () => {
    it('returns entries array', async () => {
      const res = await api('/api/leaderboard/daily');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('entries');
      expect(data.entries).toBeInstanceOf(Array);
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns {user: null} when unauthenticated', async () => {
      const res = await api('/api/auth/me');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ user: null });
    });
  });

  describe('POST /api/guess', () => {
    it('accepts guess and returns feedback', async () => {
      const res = await postJson('/api/guess', {
        puzzleId: 1,
        phoneId: 1,
        guessNumber: 1,
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('feedback');
      expect(['correct', 'right_brand', 'wrong_brand']).toContain(
        data.feedback,
      );
    });
  });

  describe('POST /api/result', () => {
    it('returns 401 without session', async () => {
      const res = await postJson('/api/result', {
        puzzleId: 1,
        guessCount: 3,
        isWin: true,
        elapsedSeconds: 45,
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/hint', () => {
    it('returns 401 without session', async () => {
      const res = await postJson('/api/hint', {
        puzzleId: 1,
        hintType: 'brand',
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('GET /api/profile/stats', () => {
    it('returns 401 without session', async () => {
      const res = await api('/api/profile/stats');
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('POST /api/profile/update', () => {
    it('returns 401 without session', async () => {
      const res = await postJson('/api/profile/update', {
        displayName: 'Test',
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });
  });
});
