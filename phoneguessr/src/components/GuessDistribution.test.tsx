import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GuessDistribution } from './GuessDistribution';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.guessDistribution': 'Guess Distribution',
        'profile.noDataYet': 'No data yet',
      };
      return translations[key] || key;
    },
  }),
}));

function setLocalStorage(entries: Record<string, unknown>) {
  localStorage.clear();
  for (const [key, value] of Object.entries(entries)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

describe('GuessDistribution', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('shows empty state when no games played', () => {
    render(<GuessDistribution />);
    expect(screen.getByText('Guess Distribution')).toBeInTheDocument();
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('shows empty state when only lost games exist', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [
          { phoneName: 'a', feedback: 'wrong_brand' },
          { phoneName: 'b', feedback: 'wrong_brand' },
          { phoneName: 'c', feedback: 'wrong_brand' },
          { phoneName: 'd', feedback: 'wrong_brand' },
          { phoneName: 'e', feedback: 'wrong_brand' },
          { phoneName: 'f', feedback: 'wrong_brand' },
        ],
        elapsed: 30,
        won: false,
      },
    });
    render(<GuessDistribution />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders bars for won games', () => {
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
      'phoneguessr_2026-03-03': {
        guesses: [{ phoneName: 'Pixel 9', feedback: 'correct' }],
        elapsed: 3,
        won: true,
      },
    });
    const { container } = render(<GuessDistribution />);

    // Should not show empty state
    expect(screen.queryByText('No data yet')).not.toBeInTheDocument();

    // Should show the title
    expect(screen.getByText('Guess Distribution')).toBeInTheDocument();

    // Should show 6 rows
    const rows = container.querySelectorAll('.guess-distribution-row');
    expect(rows.length).toBe(6);

    // 2 wins in 1 guess: bar count should show "2"
    const firstBarCount = rows[0].querySelector('.guess-distribution-count');
    expect(firstBarCount?.textContent).toBe('2');

    // 1 win in 2 guesses: bar count should show "1"
    const secondBarCount = rows[1].querySelector('.guess-distribution-count');
    expect(secondBarCount?.textContent).toBe('1');
  });

  it('highlights current game bar when currentGuessCount is provided', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [
          { phoneName: 'a', feedback: 'wrong_brand' },
          { phoneName: 'b', feedback: 'wrong_brand' },
          { phoneName: 'c', feedback: 'correct' },
        ],
        elapsed: 15,
        won: true,
      },
    });
    const { container } = render(<GuessDistribution currentGuessCount={3} />);

    const highlightedBar = container.querySelector(
      '.guess-distribution-bar-current',
    );
    expect(highlightedBar).toBeInTheDocument();
  });

  it('does not highlight any bar when no currentGuessCount', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [{ phoneName: 'a', feedback: 'correct' }],
        elapsed: 5,
        won: true,
      },
    });
    const { container } = render(<GuessDistribution />);

    const highlightedBar = container.querySelector(
      '.guess-distribution-bar-current',
    );
    expect(highlightedBar).not.toBeInTheDocument();
  });

  it('ignores non-phoneguessr localStorage keys', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [{ phoneName: 'a', feedback: 'correct' }],
        elapsed: 5,
        won: true,
      },
      some_other_key: { data: 'irrelevant' },
    });
    render(<GuessDistribution />);
    expect(screen.queryByText('No data yet')).not.toBeInTheDocument();
  });

  it('ignores phoneguessr_lang key', () => {
    localStorage.setItem('phoneguessr_lang', 'en');
    render(<GuessDistribution />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('ignores phoneguessr_onboarded key', () => {
    localStorage.setItem('phoneguessr_onboarded', '1');
    render(<GuessDistribution />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('shows zero count bars with minimal width', () => {
    setLocalStorage({
      'phoneguessr_2026-03-01': {
        guesses: [{ phoneName: 'a', feedback: 'correct' }],
        elapsed: 5,
        won: true,
      },
    });
    const { container } = render(<GuessDistribution />);

    const zeroBars = container.querySelectorAll('.guess-distribution-bar-zero');
    // 5 bars should be zero (guesses 2-6)
    expect(zeroBars.length).toBe(5);
  });
});
