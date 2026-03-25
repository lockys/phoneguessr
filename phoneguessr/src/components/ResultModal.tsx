import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { generateShareText } from '../lib/share';

interface Guess {
  phoneName: string;
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

interface ResultModalProps {
  won: boolean;
  guesses: Guess[];
  elapsed: number;
  puzzleNumber: number;
  onClose: () => void;
}

export function ResultModal({
  won,
  guesses,
  elapsed,
  puzzleNumber,
  onClose,
}: ResultModalProps) {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [copied, setCopied] = useState(false);

  const wrongGuesses = guesses.filter(g => g.feedback !== 'correct').length;
  const score = won ? elapsed + wrongGuesses * 10 : null;

  const handleShare = async () => {
    const text = generateShareText(puzzleNumber, guesses, won);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (insecure context or permission denied)
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <dialog className="modal-card" open aria-modal="true">
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>

        <div className="game-over">
          <h2 className="game-over-title">
            {won ? t('result.win') : t('result.loss')}
          </h2>

          <div className="game-over-stats">
            <div className="stat">
              <span className="stat-value">
                {won ? guesses.length : 'X'}/{6}
              </span>
              <span className="stat-label">{t('result.guesses')}</span>
            </div>
            {score !== null && (
              <div className="stat">
                <span className="stat-value">{score.toFixed(1)}s</span>
                <span className="stat-label">{t('result.score')}</span>
              </div>
            )}
            <div className="stat">
              <span className="stat-value">{elapsed.toFixed(1)}s</span>
              <span className="stat-label">{t('result.time')}</span>
            </div>
          </div>

          <button type="button" className="share-btn" onClick={handleShare}>
            {copied ? t('result.copied') : t('result.share')}
          </button>

          {!user && (
            <div className="auth-prompt">
              <p>{t('result.signInPrompt')}</p>
              <button
                type="button"
                className="auth-btn auth-btn-login"
                onClick={login}
              >
                {t('auth.signIn')}
              </button>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
}
