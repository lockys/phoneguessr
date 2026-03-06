import { describe, expect, it } from 'vitest';
import { validateResultInput } from '../src/lib/validation';

describe('validateResultInput', () => {
  const validInput = {
    puzzleId: 1,
    guessCount: 3,
    isWin: true,
    elapsedSeconds: 45.5,
  };

  it('accepts valid input', () => {
    const result = validateResultInput(validInput);
    expect(result).toEqual({ valid: true, value: validInput });
  });

  it('accepts a loss with zero score', () => {
    const input = { ...validInput, isWin: false, elapsedSeconds: 120 };
    const result = validateResultInput(input);
    expect(result.valid).toBe(true);
  });

  it('accepts elapsedSeconds of 0', () => {
    const input = { ...validInput, elapsedSeconds: 0 };
    const result = validateResultInput(input);
    expect(result.valid).toBe(true);
  });

  it('accepts guessCount of 1 (first try win)', () => {
    const input = { ...validInput, guessCount: 1 };
    const result = validateResultInput(input);
    expect(result.valid).toBe(true);
  });

  it('rejects null body', () => {
    const result = validateResultInput(null);
    expect(result.valid).toBe(false);
  });

  it('rejects non-object body', () => {
    const result = validateResultInput('not an object');
    expect(result.valid).toBe(false);
  });

  it('rejects puzzleId <= 0', () => {
    const result = validateResultInput({ ...validInput, puzzleId: 0 });
    expect(result.valid).toBe(false);
  });

  it('rejects negative puzzleId', () => {
    const result = validateResultInput({ ...validInput, puzzleId: -1 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-integer puzzleId', () => {
    const result = validateResultInput({ ...validInput, puzzleId: 1.5 });
    expect(result.valid).toBe(false);
  });

  it('rejects string puzzleId', () => {
    const result = validateResultInput({ ...validInput, puzzleId: '1' });
    expect(result.valid).toBe(false);
  });

  it('rejects guessCount < 1', () => {
    const result = validateResultInput({ ...validInput, guessCount: 0 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-integer guessCount', () => {
    const result = validateResultInput({ ...validInput, guessCount: 2.5 });
    expect(result.valid).toBe(false);
  });

  it('rejects non-boolean isWin', () => {
    const result = validateResultInput({ ...validInput, isWin: 1 });
    expect(result.valid).toBe(false);
  });

  it('rejects string isWin', () => {
    const result = validateResultInput({ ...validInput, isWin: 'true' });
    expect(result.valid).toBe(false);
  });

  it('rejects negative elapsedSeconds', () => {
    const result = validateResultInput({ ...validInput, elapsedSeconds: -1 });
    expect(result.valid).toBe(false);
  });

  it('rejects NaN elapsedSeconds', () => {
    const result = validateResultInput({
      ...validInput,
      elapsedSeconds: Number.NaN,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects Infinity elapsedSeconds', () => {
    const result = validateResultInput({
      ...validInput,
      elapsedSeconds: Number.POSITIVE_INFINITY,
    });
    expect(result.valid).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = validateResultInput({ puzzleId: 1 });
    expect(result.valid).toBe(false);
  });
});
