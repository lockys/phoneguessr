interface ResultInput {
  puzzleId: number;
  guessCount: number;
  isWin: boolean;
  elapsedSeconds: number;
}

export function validateResultInput(
  body: unknown,
): { valid: true; value: ResultInput } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Body must be an object' };
  }
  const b = body as Record<string, unknown>;
  if (
    typeof b.puzzleId !== 'number' ||
    b.puzzleId <= 0 ||
    !Number.isInteger(b.puzzleId)
  ) {
    return { valid: false, error: 'puzzleId must be a positive integer' };
  }
  if (
    typeof b.guessCount !== 'number' ||
    b.guessCount < 1 ||
    !Number.isInteger(b.guessCount)
  ) {
    return { valid: false, error: 'guessCount must be a positive integer' };
  }
  if (typeof b.isWin !== 'boolean') {
    return { valid: false, error: 'isWin must be a boolean' };
  }
  if (
    typeof b.elapsedSeconds !== 'number' ||
    b.elapsedSeconds < 0 ||
    !Number.isFinite(b.elapsedSeconds)
  ) {
    return {
      valid: false,
      error: 'elapsedSeconds must be a non-negative number',
    };
  }
  return {
    valid: true,
    value: {
      puzzleId: b.puzzleId as number,
      guessCount: b.guessCount as number,
      isWin: b.isWin as boolean,
      elapsedSeconds: b.elapsedSeconds as number,
    },
  };
}

export function validateDisplayName(
  raw: unknown,
): { valid: true; value: string } | { valid: false; error: string } {
  if (typeof raw !== 'string') {
    return { valid: false, error: 'displayName must be a string' };
  }
  const trimmed = raw.trim();
  if (trimmed.length < 1 || trimmed.length > 50) {
    return {
      valid: false,
      error: 'Invalid displayName: must be 1-50 characters with no HTML',
    };
  }
  if (/[<>]/.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid displayName: must be 1-50 characters with no HTML',
    };
  }
  return { valid: true, value: trimmed };
}
