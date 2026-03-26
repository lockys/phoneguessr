import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Guess {
  phoneName: string;
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

interface GuessHistoryProps {
  guesses: Guess[];
  maxGuesses: number;
  pendingGuessName?: string | null;
}

export function GuessHistory({
  guesses,
  maxGuesses,
  pendingGuessName,
}: GuessHistoryProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(guesses.length);
  const [animIndex, setAnimIndex] = useState(-1);
  const [animClasses, setAnimClasses] = useState('');

  useEffect(() => {
    const prev = prevCountRef.current;
    prevCountRef.current = guesses.length;

    // Only animate when exactly one new guess is added (not bulk load from localStorage)
    if (guesses.length !== prev + 1) return;

    const idx = guesses.length - 1;
    const feedback = guesses[idx].feedback;

    // Auto-scroll to show latest guess
    requestAnimationFrame(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });

    // Phase 1: slide-in with neutral border
    setAnimIndex(idx);
    setAnimClasses('guess-row-enter guess-row-neutral');

    // Phase 2: color reveal (remove neutral, border-color transitions via CSS)
    const t1 = setTimeout(() => {
      setAnimClasses('guess-row-enter');
    }, 150);

    // Phase 3: feedback-specific animation
    const t2 = setTimeout(() => {
      if (feedback === 'wrong_brand') {
        setAnimClasses('guess-row-shake');
      } else if (feedback === 'correct') {
        setAnimClasses('guess-row-pulse');
      } else {
        setAnimClasses('');
      }
    }, 450);

    // Phase 4: cleanup
    const t3 = setTimeout(() => {
      setAnimIndex(-1);
      setAnimClasses('');
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [guesses]);

  const FEEDBACK_CONFIG = {
    wrong_brand: { label: t('guess.wrongBrand'), className: 'guess-wrong' },
    right_brand: { label: t('guess.rightBrand'), className: 'guess-close' },
    correct: { label: t('guess.correct'), className: 'guess-correct' },
  };

  return (
    <div className="guess-history" ref={containerRef}>
      {guesses.map((guess, i) => {
        const config =
          FEEDBACK_CONFIG[guess.feedback] ?? FEEDBACK_CONFIG.wrong_brand;
        const extra = i === animIndex ? ` ${animClasses}` : '';
        return (
          <div
            key={guess.phoneName}
            className={`guess-row ${config.className}${extra}`}
          >
            <span className="guess-name">{guess.phoneName}</span>
            <span className="guess-label">{config.label}</span>
          </div>
        );
      })}
      {pendingGuessName && (
        <div className="guess-row guess-pending">
          <span className="guess-name">{pendingGuessName}</span>
          <span className="guess-label guess-validating">
            <span className="guess-validating-dot" />
            <span className="guess-validating-dot" />
            <span className="guess-validating-dot" />
          </span>
        </div>
      )}
      {!pendingGuessName && maxGuesses - guesses.length > 0 && (
        <div className="guess-remaining-text">
          {t('guess.remaining', { count: maxGuesses - guesses.length })}
        </div>
      )}
    </div>
  );
}
