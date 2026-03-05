import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GuessHistory } from './GuessHistory';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      const map: Record<string, string> = {
        'guess.wrongBrand': 'Wrong brand',
        'guess.rightBrand': 'Right brand',
        'guess.correct': 'Correct!',
      };
      if (key === 'guess.remaining') return `${opts?.count} guesses left`;
      return map[key] ?? key;
    },
  }),
}));

type Feedback = 'wrong_brand' | 'right_brand' | 'correct';

function makeGuess(feedback: Feedback, name = 'Samsung Galaxy S24') {
  return { phoneName: name, feedback };
}

describe('GuessHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('renders guess rows with correct feedback classes', () => {
    const guesses = [
      makeGuess('wrong_brand', 'Apple iPhone 15'),
      makeGuess('right_brand', 'Samsung Galaxy S23'),
      makeGuess('correct', 'Samsung Galaxy S24'),
    ];
    render(<GuessHistory guesses={guesses} maxGuesses={6} />);

    const rows = document.querySelectorAll('.guess-row:not(.guess-empty)');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveClass('guess-wrong');
    expect(rows[1]).toHaveClass('guess-close');
    expect(rows[2]).toHaveClass('guess-correct');
  });

  it('renders empty slots for remaining guesses', () => {
    render(
      <GuessHistory guesses={[makeGuess('wrong_brand')]} maxGuesses={6} />,
    );

    const emptyRows = document.querySelectorAll('.guess-empty');
    expect(emptyRows).toHaveLength(5);
    expect(screen.getByText('5 guesses left')).toBeInTheDocument();
  });

  it('does not animate on initial bulk load', () => {
    const guesses = [
      makeGuess('wrong_brand', 'Apple iPhone 15'),
      makeGuess('right_brand', 'Samsung Galaxy S23'),
    ];
    render(<GuessHistory guesses={guesses} maxGuesses={6} />);

    const rows = document.querySelectorAll('.guess-row:not(.guess-empty)');
    expect(rows[0]).not.toHaveClass('guess-row-enter');
    expect(rows[1]).not.toHaveClass('guess-row-enter');
  });

  it('applies slide-in animation when a single new guess is added', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    const newGuesses = [makeGuess('wrong_brand')];
    rerender(<GuessHistory guesses={newGuesses} maxGuesses={6} />);

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).toHaveClass('guess-row-enter');
    expect(row).toHaveClass('guess-row-neutral');
  });

  it('reveals color after 150ms delay', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    rerender(
      <GuessHistory guesses={[makeGuess('wrong_brand')]} maxGuesses={6} />,
    );

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).toHaveClass('guess-row-neutral');

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(row).toHaveClass('guess-row-enter');
    expect(row).not.toHaveClass('guess-row-neutral');
  });

  it('applies shake animation for wrong_brand after color reveal', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    rerender(
      <GuessHistory guesses={[makeGuess('wrong_brand')]} maxGuesses={6} />,
    );

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).toHaveClass('guess-row-shake');
    expect(row).not.toHaveClass('guess-row-enter');
  });

  it('applies pulse animation for correct guess after color reveal', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    rerender(<GuessHistory guesses={[makeGuess('correct')]} maxGuesses={6} />);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).toHaveClass('guess-row-pulse');
  });

  it('does not apply shake or pulse for right_brand', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    rerender(
      <GuessHistory guesses={[makeGuess('right_brand')]} maxGuesses={6} />,
    );

    act(() => {
      vi.advanceTimersByTime(450);
    });

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).not.toHaveClass('guess-row-shake');
    expect(row).not.toHaveClass('guess-row-pulse');
  });

  it('cleans up animation classes after 800ms', () => {
    const { rerender } = render(<GuessHistory guesses={[]} maxGuesses={6} />);

    rerender(
      <GuessHistory guesses={[makeGuess('wrong_brand')]} maxGuesses={6} />,
    );

    act(() => {
      vi.advanceTimersByTime(800);
    });

    const row = document.querySelector('.guess-row:not(.guess-empty)');
    expect(row).not.toHaveClass('guess-row-enter');
    expect(row).not.toHaveClass('guess-row-neutral');
    expect(row).not.toHaveClass('guess-row-shake');
    expect(row).not.toHaveClass('guess-row-pulse');
  });

  it('only animates the newest row, not previous ones', () => {
    const { rerender } = render(
      <GuessHistory
        guesses={[makeGuess('wrong_brand', 'Apple iPhone 15')]}
        maxGuesses={6}
      />,
    );

    rerender(
      <GuessHistory
        guesses={[
          makeGuess('wrong_brand', 'Apple iPhone 15'),
          makeGuess('right_brand', 'Samsung Galaxy S23'),
        ]}
        maxGuesses={6}
      />,
    );

    const rows = document.querySelectorAll('.guess-row:not(.guess-empty)');
    expect(rows[0]).not.toHaveClass('guess-row-enter');
    expect(rows[1]).toHaveClass('guess-row-enter');
  });
});
