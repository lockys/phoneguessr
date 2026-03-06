import { useMemo, useRef } from 'react';

const GRID_SIZE = 6;
const TOTAL_BLOCKS = GRID_SIZE * GRID_SIZE;
const INITIAL_REMOVED = 10; // Start with gaps so users get a zoomed peek
const BLOCKS_PER_LEVEL = 5; // blocks removed per wrong guess

interface BlockGridProps {
  level: number; // 0-5 (number of wrong guesses)
  revealed: boolean;
  isWin?: boolean;
}

/**
 * Deterministic shuffle using a simple seed-based PRNG.
 * Same seed → same removal order every time (consistent per puzzle date).
 */
function seededShuffle(arr: number[], seed: number): number[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getDateSeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  const [y, m, d] = today.split('-').map(Number);
  return y * 10000 + m * 100 + d;
}

export function BlockGrid({ level, revealed, isWin }: BlockGridProps) {
  const initialRevealedRef = useRef(revealed);

  const removalOrder = useMemo(
    () =>
      seededShuffle(
        Array.from({ length: TOTAL_BLOCKS }, (_, i) => i),
        getDateSeed(),
      ),
    [],
  );

  // Blocks removed during gameplay (NOT including reveal)
  const gameplayRemovedCount = Math.min(
    INITIAL_REMOVED + level * BLOCKS_PER_LEVEL,
    TOTAL_BLOCKS,
  );
  const gameplayRemovedSet = useMemo(
    () => new Set(removalOrder.slice(0, gameplayRemovedCount)),
    [removalOrder, gameplayRemovedCount],
  );

  // Remaining blocks that need cascade on reveal
  const remainingOrder = useMemo(
    () => removalOrder.filter(idx => !gameplayRemovedSet.has(idx)),
    [removalOrder, gameplayRemovedSet],
  );

  // Skip rendering for completed puzzles loaded from localStorage
  if (initialRevealedRef.current) return null;

  return (
    <div className="block-grid">
      {Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
        const row = Math.floor(i / GRID_SIZE);
        const col = i % GRID_SIZE;

        const wasRemovedDuringGameplay = gameplayRemovedSet.has(i);
        const needsCascade = revealed && !wasRemovedDuringGameplay;

        let style: React.CSSProperties = {
          left: `${(col / GRID_SIZE) * 100}%`,
          top: `${(row / GRID_SIZE) * 100}%`,
          width: `${100 / GRID_SIZE}%`,
          height: `${100 / GRID_SIZE}%`,
        };

        if (needsCascade) {
          const staggerIndex = remainingOrder.indexOf(i);
          if (isWin) {
            style = {
              ...style,
              animationDelay: `${staggerIndex * 40}ms`,
              animationDuration: '0.4s',
            };
          } else {
            style = {
              ...style,
              animationDelay: '0ms',
              animationDuration: '0.3s',
            };
          }
        } else if (wasRemovedDuringGameplay && !revealed) {
          // Stagger within the removal batch
          const posInRemoval = removalOrder.indexOf(i);
          const batchStart =
            Math.floor(posInRemoval / BLOCKS_PER_LEVEL) * BLOCKS_PER_LEVEL;
          const batchIndex = posInRemoval - batchStart;
          style = { ...style, transitionDelay: `${batchIndex * 30}ms` };
        }

        const className = [
          'block-cell',
          wasRemovedDuringGameplay ? 'block-removed' : '',
          needsCascade && isWin ? 'block-cascade-win' : '',
          needsCascade && !isWin ? 'block-cascade-loss' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return <div key={i} className={className} style={style} />;
      })}
    </div>
  );
}
