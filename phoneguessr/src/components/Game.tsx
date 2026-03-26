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
  const [pendingGuessName, setPendingGuessName] = useState<string | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const elapsedRef = useRef(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/puzzle/today').then(r => r.json()),
      fetch('/api/phones').then(r => r.json()),
    ]).then(async ([puzzleData, phonesData]) => {
      setPuzzle(puzzleData);
      setPhoneList(phonesData.phones);

      const imgRes = await fetch(puzzleData.imageUrl);
      const imgData = await imgRes.json();
      setImageUrl(imgData.imageUrl);

      let restored = false;

      // Authenticated: state is embedded in the puzzle response (no race condition)
      if (puzzleData.state && !puzzleData._mockAnswerId) {
        const { state } = puzzleData;
        if (state.guesses?.length > 0 || state.won != null) {
          setGuesses(state.guesses || []);
          if (state.elapsed != null) elapsedRef.current = state.elapsed;
          if (state.won != null) {
            setAlreadyPlayed(true);
            setGameState(state.won ? 'won' : 'lost');
            setShowModal(true);
          } else {
            setGameState('playing');
            setTimerRunning(true);
          }
          restored = true;
        }
      }

      // Anonymous users: check localStorage
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

    const phoneName = `${phone.brand} ${phone.model}`;
    setPendingGuessName(phoneName);

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

      if (res.status === 409) {
        // Already played today — restore completed state from DB
        try {
          const stateRes = await fetch('/api/puzzle/state');
          if (stateRes.ok) {
            const state = await stateRes.json();
            if (state?.guesses?.length > 0) {
              setGuesses(state.guesses);
              if (state.elapsed != null) elapsedRef.current = state.elapsed;
            }
            setTimerRunning(false);
            setGameState(state?.won ? 'won' : 'lost');
          } else {
            setTimerRunning(false);
            setGameState('lost');
          }
        } catch {
          setTimerRunning(false);
          setGameState('lost');
        }
        setPendingGuessName(null);
        setAlreadyPlayed(true);
        setShowModal(true);
        return;
      }

      ({ feedback } = await res.json());
    }
    setPendingGuessName(null);
    const newGuess: Guess = {
      phoneName,
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
    // Signal to InstallPrompt that the user has completed a game
    localStorage.setItem('phoneguessr_install_eligible', 'true');
  };

  if (gameState === 'loading' || !puzzle) {
    return <div className="game-loading">{t('game.loading')}</div>;
  }

  const isFinished = gameState === 'won' || gameState === 'lost';

  return (
    <div className="game">
      <div className="game-header">
        <div className="game-meta">
          #{puzzle.puzzleNumber}
          <Timer running={timerRunning} onTick={handleTick} />
        </div>
        {gameState === 'playing' && !pendingGuessName && (
          <div className="guess-remaining-text">
            {t('guess.remaining', { count: MAX_GUESSES - guesses.length })}
          </div>
        )}
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

      <GuessHistory guesses={guesses} pendingGuessName={pendingGuessName} />

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
          alreadyPlayed={alreadyPlayed}
        />
      )}

      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </div>
  );
}
