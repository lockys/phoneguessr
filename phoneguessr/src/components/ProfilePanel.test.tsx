import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePanel } from './ProfilePanel';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.yourStats': 'Your Stats',
        'profile.played': 'Played',
        'profile.wins': 'Wins',
        'profile.winRate': 'Win Rate',
        'profile.streak': 'Streak',
        'profile.best': 'Best',
        'profile.loading': 'Loading stats...',
        'profile.signInPrompt': 'Sign in to sync',
        'profile.guessDistribution': 'Guess Distribution',
        'profile.noDataYet': 'No data yet',
        'auth.signIn': 'Sign in with Google',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock auth context (unauthenticated user)
vi.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

function setLocalStorage(entries: Record<string, unknown>) {
  localStorage.clear();
  for (const [key, value] of Object.entries(entries)) {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
}

describe('ProfilePanel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows correct stats for game data', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [{ phoneName: 'iPhone 16', feedback: 'correct' }],
        elapsed: 5,
        won: true,
      },
      'phoneguessr_2026-03-02': {
        guesses: [
          { phoneName: 'Samsung S24', feedback: 'wrong_brand' },
          { phoneName: 'iPhone 16', feedback: 'correct' },
        ],
        elapsed: 10,
        won: true,
      },
    });

    render(<ProfilePanel />);

    // Should show 2 games played
    const statValues = document.querySelectorAll('.profile-stat-value');
    expect(statValues[0].textContent).toBe('2'); // gamesPlayed
    expect(statValues[1].textContent).toBe('2'); // wins
    expect(statValues[2].textContent).toBe('100%'); // winRate
  });

  it('ignores phoneguessr_lang and phoneguessr_onboarded keys in stats', () => {
    setLocalStorage({
      phoneguessr_lang: 'en',
      phoneguessr_onboarded: '1',
      'phoneguessr_2026-03-01': {
        guesses: [{ phoneName: 'iPhone 16', feedback: 'correct' }],
        elapsed: 5,
        won: true,
      },
    });

    render(<ProfilePanel />);

    // Should show only 1 game played (not 3)
    const statValues = document.querySelectorAll('.profile-stat-value');
    expect(statValues[0].textContent).toBe('1'); // gamesPlayed
    expect(statValues[1].textContent).toBe('1'); // wins
    expect(statValues[2].textContent).toBe('100%'); // winRate
  });

  it('shows zero stats when only non-game keys exist', () => {
    setLocalStorage({
      phoneguessr_lang: 'en',
      phoneguessr_onboarded: '1',
    });

    render(<ProfilePanel />);

    const statValues = document.querySelectorAll('.profile-stat-value');
    expect(statValues[0].textContent).toBe('0'); // gamesPlayed
  });
});
