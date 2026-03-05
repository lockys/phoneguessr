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
