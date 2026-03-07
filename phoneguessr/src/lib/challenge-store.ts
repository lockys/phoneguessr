const TTL_MS = 60_000;

interface Entry {
  challenge: string;
  expiresAt: number;
}

const store = new Map<string, Entry>();

export function setChallenge(key: string, challenge: string): void {
  store.set(key, { challenge, expiresAt: Date.now() + TTL_MS });
}

export function getChallenge(key: string): string | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.challenge;
}

export function deleteChallenge(key: string): void {
  store.delete(key);
}
