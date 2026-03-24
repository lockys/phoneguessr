import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';
import { useAuth } from '../lib/auth-context';
import { Confetti } from './Confetti';
import { CropReveal } from './CropReveal';
import { GuessHistory } from './GuessHistory';
import { Onboarding, isOnboarded } from './Onboarding';
import { PhoneAutocomplete } from './PhoneAutocomplete';
import { ResultModal } from './ResultModal';
import { Timer } from './Timer';

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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
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
      setImageUrl(imgData.imageUrl);

      let restored = false;

      // Authenticated users: load state from database
      if (user && !puzzleData._mockAnswerId) {
        try {
          const stateRes = await fetch('/api/puzzle/state');
          if (stateRes.ok) {
            const state = await stateRes.json();
            if (state && state.guesses?.length > 0) {
              setGuesses(state.guesses);
              if (state.elapsed != null) elapsedRef.current = state.elapsed;
              if (state.won != null) {
                setGameState(state.won ? 'won' : 'lost');
                setShowModal(true);
              } else {
                // Mid-game: guesses exist but no result yet
                setGameState('playing');
                setTimerRunning(true);
              }
              restored = true;
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }

      // Anonymous users (or DB fetch failed): check localStorage
      if (!restored) {
        const saved = localStorage.getItem(
          `phoneguessr_${puzzleData.puzzleDate}`,
        );
        if (saved) {
          const state = JSON.parse(saved);
          setGuesses(state.guesses);
          elapsedRef.current = state.elapsed;
          setGameState(state.won ? 'won' : 'lost');
          setShowModal(true);
          restored = true;
        }
      }

      if (!restored) {
        setGameState('ready');
        if (!isOnboarded()) {
          setShowOnboarding(true);
        }
      }
    });
  }, []);

  const handleTick = useCallback((secs: number) => {
    elapsedRef.current = secs;
  }, []);

  const handleRevealComplete = useCallback(() => setShowModal(true), []);

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
    setGuesses(prev => {
      const newGuesses = [...prev, newGuess];

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

      return newGuesses;
    });
  };

  const saveResult = async (finalGuesses: Guess[], won: boolean) => {
    if (!puzzle) return;

    const elapsed = elapsedRef.current;

    if (user && !puzzle._mockAnswerId) {
      // Authenticated: save to database only
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
    } else {
      // Anonymous or mock mode: save to localStorage
      localStorage.setItem(
        `phoneguessr_${puzzle.puzzleDate}`,
        JSON.stringify({ guesses: finalGuesses, elapsed, won }),
      );
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
          imageSrc={imageUrl}
          level={guesses.length}
          revealed={isFinished}
          isWin={
            gameState === 'won'
              ? true
              : gameState === 'lost'
                ? false
                : undefined
          }
          onRevealComplete={handleRevealComplete}
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

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </div>
  );
}
