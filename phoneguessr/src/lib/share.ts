interface Guess {
  feedback: 'wrong_brand' | 'right_brand' | 'correct';
}

const FEEDBACK_EMOJI: Record<string, string> = {
  wrong_brand: '\u274C',
  right_brand: '\uD83D\uDFE1',
  correct: '\u2705',
};

export function generateShareText(
  puzzleNumber: number,
  guesses: Guess[],
  won: boolean,
): string {
  const result = won ? `${guesses.length}/6` : 'X/6';
  const emojis = guesses.map(g => FEEDBACK_EMOJI[g.feedback]).join('');

  return `PhoneGuessr #${puzzleNumber} ${result}\n\n${emojis}\n\nphoneguessr.com`;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_INDICATOR: Record<Difficulty, string> = {
  easy: '\uD83D\uDFE2 Easy',
  medium: '\uD83D\uDFE1 Medium',
  hard: '\uD83D\uDD34 Hard',
};

const SHARE_SQUARE_EMOJI: Record<string, string> = {
  wrong_brand: '\uD83D\uDFE5',
  right_brand: '\uD83D\uDFE8',
  correct: '\uD83D\uDFE9',
};

export interface EnhancedShareOptions {
  puzzleNumber: number;
  guesses: Guess[];
  won: boolean;
  difficulty: Difficulty;
  streak: number;
  hintsUsed: number;
  elapsedSeconds: number;
}

export function generateEnhancedShareText(opts: EnhancedShareOptions): string {
  const result = opts.won ? `${opts.guesses.length}/6` : 'X/6';
  const diffLabel = DIFFICULTY_INDICATOR[opts.difficulty];
  const emojiGrid = opts.guesses
    .map(g => SHARE_SQUARE_EMOJI[g.feedback])
    .join('');

  const lines: string[] = [];

  // Header: PhoneGuessr #N X/6 🟢 Easy
  lines.push(`PhoneGuessr #${opts.puzzleNumber} ${result} ${diffLabel}`);

  // Streak line (only if >= 2)
  if (opts.streak >= 2) {
    lines.push(`\uD83D\uDD25${opts.streak}`);
  }

  // Blank line + emoji grid
  lines.push('');
  lines.push(emojiGrid);

  // Footer: hints + time
  const footerParts: string[] = [];
  if (opts.hintsUsed > 0) {
    footerParts.push(`\uD83D\uDCA1\u00D7${opts.hintsUsed}`);
  }
  if (opts.won) {
    footerParts.push(`\u23F1\uFE0F ${opts.elapsedSeconds.toFixed(1)}s`);
  }
  if (footerParts.length > 0) {
    lines.push(footerParts.join(' | '));
  }

  // Site URL
  lines.push('');
  lines.push('phoneguessr.com');

  return lines.join('\n');
}
