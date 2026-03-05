import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { CropReveal } from './CropReveal';
import { Confetti } from './Confetti';
import { PhoneAutocomplete } from './PhoneAutocomplete';
import { Timer } from './Timer';
import { GuessHistory } from './GuessHistory';
import { ResultModal } from './ResultModal';
import { useAuth } from '../lib/auth-context';

const MAX_GUESSES = 6;

interface Phone {
  id: number;
  brand: string;
  model: string;
}

interface Guess {
  phoneName: string;
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

interface PuzzleData {
  puzzleId: number;
  puzzleNumber: number;
  puzzleDate: string;
  imageUrl: string;
  _mockAnswerId?: number;
  _mockAnswerBrand?: string;
}

type GameState = 'loading' | 'ready' | 'playing' | 'won' | 'lost';

export function Game() {
  const { t } = useTranslation();
  const haptic = useWebHaptics();
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>('loading');
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [phoneList, setPhoneList] = useState<Phone[]>([]);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imageData, setImageData] = useState<string>('');
  const elapsedRef = useRef(0);

  // Check localStorage for already-played state
  useEffect(() => {
    Promise.all([
      fetch('/api/puzzle/today').then(r => r.json()),
      fetch('/api/phones').then(r => r.json()),
    ]).then(async ([puzzleData, phonesData]) => {
      setPuzzle(puzzleData);
      setPhoneList(phonesData.phones);

      // Fetch image as base64 to prevent cheating via filename
      const imgRes = await fetch(puzzleData.imageUrl);
      const imgData = await imgRes.json();
      setImageData(imgData.imageData);

      const saved = localStorage.getItem(
        `phoneguessr_${puzzleData.puzzleDate}`,
      );
      if (saved) {
        const state = JSON.parse(saved);
        setGuesses(state.guesses);
        elapsedRef.current = state.elapsed;
        setGameState(state.won ? 'won' : 'lost');
        setShowModal(true);
      } else {
        setGameState('ready');
      }
    });
  }, []);

  const handleTick = useCallback((secs: number) => {
    elapsedRef.current = secs;
  }, []);

  const handleStart = () => {
    haptic.trigger('medium');
    setGameState('playing');
    setTimerRunning(true);
  };

  const handleGuess = async (phone: Phone) => {
    if (!puzzle || gameState !== 'playing') return;

    let feedback: Guess['feedback'];

    if (puzzle._mockAnswerId != null) {
      // Mock mode: compare client-side
      if (phone.id === puzzle._mockAnswerId) {
        feedback = 'correct';
      } else if (phone.brand === puzzle._mockAnswerBrand) {
        feedback = 'right_brand';
      } else {
        feedback = 'wrong_brand';
      }
    } else {
      const res = await fetch('/api/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.puzzleId,
          phoneId: phone.id,
          guessNumber: guesses.length + 1,
        }),
      });
      ({ feedback } = await res.json());
    }
    const newGuess: Guess = {
      phoneName: `${phone.brand} ${phone.model}`,
      feedback,
    };
    const newGuesses = [...guesses, newGuess];
    setGuesses(newGuesses);

    if (feedback === 'correct') {
      haptic.trigger('success');
      setTimerRunning(false);
      setGameState('won');
      saveResult(newGuesses, true);
    } else {
      haptic.trigger('error');
      if (newGuesses.length >= MAX_GUESSES) {
        setTimerRunning(false);
        setGameState('lost');
        saveResult(newGuesses, false);
      }
    }
  };

  const saveResult = async (finalGuesses: Guess[], won: boolean) => {
    if (!puzzle) return;

    const elapsed = elapsedRef.current;

    localStorage.setItem(
      `phoneguessr_${puzzle.puzzleDate}`,
      JSON.stringify({ guesses: finalGuesses, elapsed, won }),
    );

    if (user && !puzzle._mockAnswerId) {
      await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.puzzleId,
          guessCount: finalGuesses.length,
          isWin: won,
          elapsedSeconds: elapsed,
        }),
      });
    }
  };

  if (gameState === 'loading' || !puzzle) {
    return <div className="game-loading">{t('game.loading')}</div>;
  }

  const isFinished = gameState === 'won' || gameState === 'lost';

  return (
    <div className="game">
      <div className="game-header">
        <h1 className="game-title">{t('game.title')}</h1>
        <div className="game-meta">
          #{puzzle.puzzleNumber}
          <Timer running={timerRunning} onTick={handleTick} />
        </div>
      </div>

      <div className="crop-wrapper">
        <CropReveal
        imageSrc={imageData}
        level={guesses.length}
        revealed={isFinished}
        isWin={gameState === 'won' ? true : gameState === 'lost' ? false : undefined}
        onRevealComplete={() => setShowModal(true)}
        onImageDrawn={() => setImageData('')}
      />
        {gameState === 'ready' && (
          <div className="start-overlay">
            <button type="button" className="start-btn" onClick={handleStart}>
              {t('game.start')}
            </button>
          </div>
        )}
      </div>
      <Confetti show={gameState === 'won'} />

      <GuessHistory guesses={guesses} maxGuesses={MAX_GUESSES} />

      {gameState === 'playing' && (
        <PhoneAutocomplete
          phones={phoneList}
          onSelect={handleGuess}
          disabled={false}
        />
      )}

      {showModal && isFinished && (
        <ResultModal
          won={gameState === 'won'}
          guesses={guesses}
          elapsed={elapsedRef.current}
          puzzleNumber={puzzle.puzzleNumber}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
