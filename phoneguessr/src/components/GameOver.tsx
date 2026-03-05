import { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { generateShareText } from '../lib/share';

interface Guess {
  phoneName: string;
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

interface GameOverProps {
  won: boolean;
  guesses: Guess[];
  elapsed: number;
  puzzleNumber: number;
}

export function GameOver({ won, guesses, elapsed, puzzleNumber }: GameOverProps) {
  const { user, login } = useAuth();
  const [copied, setCopied] = useState(false);

  const wrongGuesses = guesses.filter(g => g.feedback !== 'correct').length;
  const score = won ? elapsed + wrongGuesses * 10 : null;

  const handleShare = async () => {
    const text = generateShareText(puzzleNumber, guesses, won);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="game-over">
      <h2 className="game-over-title">
        {won ? 'You got it!' : 'Better luck tomorrow!'}
      </h2>

      <div className="game-over-stats">
        <div className="stat">
          <span className="stat-value">
            {won ? guesses.length : 'X'}/{6}
          </span>
          <span className="stat-label">Guesses</span>
        </div>
        {score !== null && (
          <div className="stat">
            <span className="stat-value">{score.toFixed(1)}s</span>
            <span className="stat-label">Score</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-value">{elapsed.toFixed(1)}s</span>
          <span className="stat-label">Time</span>
        </div>
      </div>

      <button type="button" className="share-btn" onClick={handleShare}>
        {copied ? 'Copied!' : 'Share'}
      </button>

      {!user && (
        <div className="auth-prompt">
          <p>Sign in to save your score to the leaderboard!</p>
          <button type="button" className="auth-btn auth-btn-login" onClick={login}>
            Sign in with Google
          </button>
        </div>
      )}
    </div>
  );
}
