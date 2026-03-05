import { useTranslation } from 'react-i18next';

interface Guess {
  phoneName: string;
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

interface GuessHistoryProps {
  guesses: Guess[];
  maxGuesses: number;
}

export function GuessHistory({ guesses, maxGuesses }: GuessHistoryProps) {
  const { t } = useTranslation();

  const FEEDBACK_CONFIG = {
    wrong_brand: { icon: '\u274C', label: t('guess.wrongBrand'), className: 'guess-wrong' },
    right_brand: { icon: '\uD83D\uDFE1', label: t('guess.rightBrand'), className: 'guess-close' },
    correct: { icon: '\u2705', label: t('guess.correct'), className: 'guess-correct' },
  };

  return (
    <div className="guess-history">
      {guesses.map((guess, i) => {
        const config = FEEDBACK_CONFIG[guess.feedback];
        return (
          <div key={i} className={`guess-row ${config.className}`}>
            <span className="guess-icon">{config.icon}</span>
            <span className="guess-name">{guess.phoneName}</span>
            <span className="guess-label">{config.label}</span>
          </div>
        );
      })}
      {maxGuesses - guesses.length > 0 && (
        <>
          <div key="empty-0" className="guess-row guess-empty guess-empty-label">
            <span className="guess-remaining">{t('guess.remaining', { count: maxGuesses - guesses.length })}</span>
          </div>
          {Array.from({ length: maxGuesses - guesses.length - 1 }).map((_, i) => (
            <div key={`empty-${i + 1}`} className="guess-row guess-empty" />
          ))}
        </>
      )}
    </div>
  );
}
