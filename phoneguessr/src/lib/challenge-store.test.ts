// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
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
});
