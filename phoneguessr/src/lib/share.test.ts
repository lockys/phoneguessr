import { describe, expect, it } from 'vitest';
import { generateEnhancedShareText, generateShareText } from './share';
import type { EnhancedShareOptions } from './share';

describe('generateShareText (legacy)', () => {
  it('generates winning share text', () => {
    const text = generateShareText(
      42,
      [
        { feedback: 'wrong_brand' },
        { feedback: 'right_brand' },
        { feedback: 'correct' },
      ],
      true,
    );
    expect(text).toContain('PhoneGuessr #42 3/6');
    expect(text).toContain('phoneguessr.com');
  });

  it('generates DNF share text', () => {
    const text = generateShareText(
      42,
      [
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
      ],
      false,
    );
    expect(text).toContain('X/6');
  });
});

describe('generateEnhancedShareText', () => {
  const baseOpts: EnhancedShareOptions = {
    puzzleNumber: 42,
    guesses: [
      { feedback: 'wrong_brand' },
      { feedback: 'wrong_brand' },
      { feedback: 'right_brand' },
      { feedback: 'correct' },
    ],
    won: true,
    difficulty: 'medium',
    streak: 5,
    hintsUsed: 1,
    elapsedSeconds: 45.0,
  };

  it('includes puzzle number and guess count', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('PhoneGuessr #42 4/6');
  });

  it('includes difficulty indicator', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('\uD83D\uDFE1 Medium');
  });

  it('includes colored square emoji grid', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('\uD83D\uDFE5\uD83D\uDFE5\uD83D\uDFE8\uD83D\uDFE9');
  });

  it('includes streak when >= 2', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('\uD83D\uDD255');
  });

  it('omits streak when < 2', () => {
    const text = generateEnhancedShareText({ ...baseOpts, streak: 1 });
    expect(text).not.toContain('\uD83D\uDD25');
  });

  it('includes hint count when > 0', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('\uD83D\uDCA1\u00D71');
  });

  it('omits hint indicator when 0 hints', () => {
    const text = generateEnhancedShareText({ ...baseOpts, hintsUsed: 0 });
    expect(text).not.toContain('\uD83D\uDCA1');
  });

  it('includes time for winning games', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('\u23F1\uFE0F 45.0s');
  });

  it('omits time for DNF', () => {
    const text = generateEnhancedShareText({
      ...baseOpts,
      won: false,
      hintsUsed: 0,
      guesses: [
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
        { feedback: 'wrong_brand' },
      ],
    });
    expect(text).not.toContain('\u23F1\uFE0F');
  });

  it('includes site URL', () => {
    const text = generateEnhancedShareText(baseOpts);
    expect(text).toContain('phoneguessr.com');
  });

  it('shows easy difficulty with green circle', () => {
    const text = generateEnhancedShareText({ ...baseOpts, difficulty: 'easy' });
    expect(text).toContain('\uD83D\uDFE2 Easy');
  });

  it('shows hard difficulty with red circle', () => {
    const text = generateEnhancedShareText({ ...baseOpts, difficulty: 'hard' });
    expect(text).toContain('\uD83D\uDD34 Hard');
  });

  it('shows X/6 for DNF', () => {
    const text = generateEnhancedShareText({
      ...baseOpts,
      won: false,
      guesses: Array(6).fill({ feedback: 'wrong_brand' }),
    });
    expect(text).toContain('X/6');
  });
});
