// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  consumeChallenge,
  deleteChallenge,
  getChallenge,
  setChallenge,
} from './challenge-store.js';

describe('challenge-store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves a challenge', () => {
    setChallenge('user-1', 'abc123');
    expect(getChallenge('user-1')).toBe('abc123');
  });

  it('returns null for unknown key', () => {
    expect(getChallenge('unknown')).toBeNull();
  });

  it('expires challenge after 60 seconds', () => {
    setChallenge('user-2', 'xyz');
    vi.advanceTimersByTime(60_001);
    expect(getChallenge('user-2')).toBeNull();
  });

  it('is still available just before TTL expires', () => {
    setChallenge('user-3', 'still-valid');
    vi.advanceTimersByTime(59_999);
    expect(getChallenge('user-3')).toBe('still-valid');
  });

  it('deletes a challenge explicitly', () => {
    setChallenge('user-4', 'to-delete');
    deleteChallenge('user-4');
    expect(getChallenge('user-4')).toBeNull();
  });

  it('overwrites an existing challenge', () => {
    setChallenge('user-5', 'first');
    setChallenge('user-5', 'second');
    expect(getChallenge('user-5')).toBe('second');
  });

  describe('consumeChallenge — replay attack prevention', () => {
    it('returns challenge value and deletes it atomically', () => {
      setChallenge('user-6', 'one-time');
      expect(consumeChallenge('user-6')).toBe('one-time');
      // Second call returns null — replay attack prevented
      expect(consumeChallenge('user-6')).toBeNull();
    });

    it('returns null for unknown key', () => {
      expect(consumeChallenge('no-such-key')).toBeNull();
    });

    it('returns null for expired challenge', () => {
      setChallenge('user-7', 'expired');
      vi.advanceTimersByTime(60_001);
      expect(consumeChallenge('user-7')).toBeNull();
    });

    it('challenge unavailable via getChallenge after consume', () => {
      setChallenge('user-8', 'secret');
      consumeChallenge('user-8');
      expect(getChallenge('user-8')).toBeNull();
    });
  });
});
