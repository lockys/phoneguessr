import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

const fetchMock = vi.fn();

function AuthProbe() {
  const auth = useAuth();
  return (
    <>
      <div data-testid="loading">{String(auth.loading)}</div>
      <div data-testid="user">{auth.user?.displayName ?? 'none'}</div>
      <div data-testid="has-passkey-api">
        {String('loginWithPasskey' in auth || 'registerPasskey' in auth)}
      </div>
      <button type="button" onClick={auth.refreshUser}>
        Refresh
      </button>
    </>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  it('loads the current user from /api/auth/me', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ user: { id: 1, displayName: 'Test User' } }),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('user').textContent).toBe('Test User');
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me');
  });

  it('does not expose passkey auth methods', async () => {
    fetchMock.mockResolvedValueOnce({
      json: () => Promise.resolve({ user: null }),
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('has-passkey-api').textContent).toBe('false');
  });

  it('refreshUser updates user state without reading hasPasskey', async () => {
    fetchMock
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ user: null }),
      })
      .mockResolvedValueOnce({
        json: () =>
          Promise.resolve({ user: { id: 2, displayName: 'Refreshed User' } }),
      });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    screen.getByRole('button', { name: 'Refresh' }).click();

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Refreshed User');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
