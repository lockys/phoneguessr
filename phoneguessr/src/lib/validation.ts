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
