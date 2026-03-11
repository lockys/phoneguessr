// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { signImageToken, verifyImageToken } from './image-token.js';

describe('signImageToken / verifyImageToken', () => {
  it('signs and verifies a valid token', async () => {
    const token = await signImageToken(42, 3);
    const result = await verifyImageToken(token);
    expect(result).toEqual({ puzzleId: 42, level: 3 });
  });

  it('returns null for a tampered token', async () => {
    const token = await signImageToken(1, 0);
    const tampered = `${token.slice(0, -4)}XXXX`;
    const result = await verifyImageToken(tampered);
    expect(result).toBeNull();
  });

  it('returns null for a garbage string', async () => {
    const result = await verifyImageToken('not.a.jwt');
    expect(result).toBeNull();
  });

  it('returns null for an empty string', async () => {
    const result = await verifyImageToken('');
    expect(result).toBeNull();
  });

  it('preserves puzzleId and level values', async () => {
    const token = await signImageToken(999, 5);
    const result = await verifyImageToken(token);
    expect(result).toEqual({ puzzleId: 999, level: 5 });
  });

  it('returns null for an expired token', async () => {
    // Mock Date to be just past midnight UTC so the token we create expires immediately
    const pastMidnight = new Date('2025-01-01T00:00:01Z');
    const beforeMidnight = new Date('2024-12-31T23:59:59Z');

    // Sign a token when it's just before midnight (expires at midnight)
    vi.useFakeTimers();
    vi.setSystemTime(beforeMidnight);
    const token = await signImageToken(1, 0);

    // Advance past the expiration (midnight UTC)
    vi.setSystemTime(pastMidnight);
    const result = await verifyImageToken(token);
    expect(result).toBeNull();

    vi.useRealTimers();
  });

  it('token is valid before midnight UTC', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T10:00:00Z'));
    const token = await signImageToken(7, 2);

    // Still same day, should be valid
    vi.setSystemTime(new Date('2025-06-15T23:59:58Z'));
    const result = await verifyImageToken(token);
    expect(result).toEqual({ puzzleId: 7, level: 2 });

    vi.useRealTimers();
  });
});
