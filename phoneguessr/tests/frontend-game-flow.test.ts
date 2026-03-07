// @vitest-environment node

/**
 * Frontend Game Flow Verification
 *
 * These tests simulate the exact sequence the Game component performs:
 * 1. Fetch puzzle data from /api/puzzle/today
 * 2. Fetch phone list from /api/phones
 * 3. Fetch puzzle image from /api/puzzle/image (via puzzleData.imageUrl)
 * 4. Submit a guess via POST /api/guess
 * 5. Verify feedback appears in correct format
 *
 * Requires `vercel dev` or equivalent running at localhost:3000.
 */

import { describe, expect, it } from 'vitest';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

function api(path: string, init?: RequestInit) {
  return fetch(`${BASE_URL}${path}`, init);
}

describe('Frontend Game Flow', () => {
  // Mirrors the Game component's PuzzleData interface
  interface PuzzleData {
    puzzleId: number;
    puzzleNumber: number;
    puzzleDate: string;
    imageUrl: string;
  }

  interface Phone {
    id: number;
    brand: string;
    model: string;
  }

  let puzzle: PuzzleData;
  let phones: Phone[];

  it('Step 1: loads daily puzzle (GET /api/puzzle/today)', async () => {
    const res = await api('/api/puzzle/today');
    expect(res.status).toBe(200);

    puzzle = await res.json();

    // Game.tsx reads these fields directly
    expect(typeof puzzle.puzzleId).toBe('number');
    expect(typeof puzzle.puzzleNumber).toBe('number');
    expect(typeof puzzle.puzzleDate).toBe('string');
    expect(puzzle.imageUrl).toBe('/api/puzzle/image');

    // puzzleDate should be a valid date string (YYYY-MM-DD)
    expect(puzzle.puzzleDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('Step 2: loads phone list for autocomplete (GET /api/phones)', async () => {
    const res = await api('/api/phones');
    expect(res.status).toBe(200);

    const data = await res.json();
    phones = data.phones;

    // PhoneAutocomplete needs an array of {id, brand, model}
    expect(phones).toBeInstanceOf(Array);
    expect(phones.length).toBeGreaterThan(0);

    for (const phone of phones.slice(0, 5)) {
      expect(typeof phone.id).toBe('number');
      expect(typeof phone.brand).toBe('string');
      expect(typeof phone.model).toBe('string');
      expect(phone.brand.length).toBeGreaterThan(0);
      expect(phone.model.length).toBeGreaterThan(0);
    }
  });

  it('Step 3: loads puzzle image as base64 data URL (GET /api/puzzle/image)', async () => {
    const res = await api('/api/puzzle/image');
    expect(res.status).toBe(200);

    const data = await res.json();

    // CropReveal component uses imageData as the img src
    expect(data).toHaveProperty('imageData');
    expect(typeof data.imageData).toBe('string');
    expect(data.imageData).toMatch(/^data:image\/(png|jpeg|svg\+xml);base64,/);

    // Verify the base64 payload is non-trivial (at least 100 chars)
    const base64Part = data.imageData.split(',')[1];
    expect(base64Part.length).toBeGreaterThan(100);
  });

  it('Step 4: submits a guess and receives feedback (POST /api/guess)', async () => {
    // Pick a phone from the list to guess
    const guessPhone = phones[0];

    const res = await api('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        puzzleId: puzzle.puzzleId,
        phoneId: guessPhone.id,
        guessNumber: 1,
      }),
    });
    expect(res.status).toBe(200);

    const data = await res.json();

    // Game.tsx expects { feedback: 'correct' | 'right_brand' | 'wrong_brand' }
    expect(data).toHaveProperty('feedback');
    expect(['correct', 'right_brand', 'wrong_brand']).toContain(data.feedback);
  });

  it(
    'Step 5: can submit multiple guesses sequentially',
    { timeout: 15000 },
    async () => {
      // Simulate the game loop — submit up to 3 guesses with different phones
      const usedPhones = phones.slice(1, 4);

      for (let i = 0; i < usedPhones.length; i++) {
        const res = await api('/api/guess', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            puzzleId: puzzle.puzzleId,
            phoneId: usedPhones[i].id,
            guessNumber: i + 2, // starts at 2 since Step 4 used guessNumber 1
          }),
        });
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(['correct', 'right_brand', 'wrong_brand']).toContain(
          data.feedback,
        );
      }
    },
  );

  it('Step 6: leaderboard loads for result modal (GET /api/leaderboard/daily)', async () => {
    const res = await api('/api/leaderboard/daily');
    expect(res.status).toBe(200);

    const data = await res.json();

    // Leaderboard component expects { entries: [...] }
    expect(data).toHaveProperty('entries');
    expect(data.entries).toBeInstanceOf(Array);
  });

  it('Step 7: auth state is available for result submission (GET /api/auth/me)', async () => {
    const res = await api('/api/auth/me');
    expect(res.status).toBe(200);

    const data = await res.json();

    // AuthContext expects { user: UserObject | null }
    expect(data).toHaveProperty('user');
    // Without a session cookie, user should be null
    expect(data.user).toBeNull();
  });
});
