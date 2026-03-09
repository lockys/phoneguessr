import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';

// Mock fetch globally
global.fetch = vi.fn().mockResolvedValue({
  json: () => Promise.resolve({ user: null }),
} as unknown as Response);

// Component that renders the webAuthnSupported flag for testing
function WebAuthnSupportIndicator() {
  const { webAuthnSupported } = useAuth();
  return (
    <div data-testid="webauthn-support">
      {webAuthnSupported ? 'supported' : 'unsupported'}
    </div>
  );
}

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('WebAuthn feature detection', () => {
  it('reports webAuthnSupported=true when browser supports WebAuthn', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
    }));

    const { AuthProvider: Provider } = await import('./auth-context');

    render(
      <Provider>
        <WebAuthnSupportIndicator />
      </Provider>,
    );

    expect(screen.getByTestId('webauthn-support').textContent).toBe(
      'supported',
    );
  });

  it('reports webAuthnSupported=false when browser lacks WebAuthn support', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => false,
    }));

    const { AuthProvider: Provider } = await import('./auth-context');

    render(
      <Provider>
        <WebAuthnSupportIndicator />
      </Provider>,
    );

    expect(screen.getByTestId('webauthn-support').textContent).toBe(
      'unsupported',
    );
  });

  it('exposes webAuthnSupported via useAuth hook', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
    }));

    const { AuthProvider: Provider, useAuth: hook } = await import(
      './auth-context'
    );

    let capturedValue: boolean | undefined;

    function Probe() {
      const auth = hook();
      capturedValue = auth.webAuthnSupported;
      return null;
    }

    render(
      <Provider>
        <Probe />
      </Provider>,
    );

    expect(capturedValue).toBe(true);
  });
});

describe('loginWithPasskey', () => {
  const mockOptions = {
    challenge: 'bW9ja0NoYWxsZW5nZUZvckxvZ2lu',
    timeout: 60000,
    rpId: 'localhost',
    allowCredentials: [],
    userVerification: 'required',
  };

  const mockUser = { id: 1, displayName: 'Test User' };

  const mockAuthResponse = {
    id: 'credId',
    rawId: 'credId',
    type: 'public-key',
    response: {},
  };

  it('fetches options, calls startAuthentication, posts result, and sets user', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
      startAuthentication: vi.fn(),
    }));

    const { startAuthentication } = await import('@simplewebauthn/browser');
    vi.mocked(startAuthentication).mockResolvedValue(mockAuthResponse as never);

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOptions),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verified: true, user: mockUser }),
      }) as unknown as typeof fetch;

    const { AuthProvider: Provider, useAuth: hook } = await import(
      './auth-context'
    );

    function TestComponent() {
      const { user, loginWithPasskey } = hook();
      return (
        <>
          <div data-testid="user">{user?.displayName ?? 'none'}</div>
          <button
            type="button"
            onClick={() => {
              loginWithPasskey();
            }}
          >
            Login
          </button>
        </>
      );
    }

    render(
      <Provider>
        <TestComponent />
      </Provider>,
    );

    expect(screen.getByTestId('user').textContent).toBe('none');

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('Test User');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/passkey/login-options',
      { method: 'POST' },
    );
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/passkey/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockAuthResponse),
      }),
    );
  });

  it('throws when login-options request fails', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
      startAuthentication: vi.fn(),
    }));

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      }) as unknown as typeof fetch;

    const { AuthProvider: Provider, useAuth: hook } = await import(
      './auth-context'
    );

    let capturedError: string | undefined;

    function TestComponent() {
      const { loginWithPasskey } = hook();
      return (
        <button
          type="button"
          onClick={() =>
            loginWithPasskey().catch(e => {
              capturedError = (e as Error).message;
            })
          }
        >
          Login
        </button>
      );
    }

    render(
      <Provider>
        <TestComponent />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(capturedError).toBe('Failed to get passkey login options');
    });
  });

  it('throws when passkey verification fails', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
      startAuthentication: vi.fn(),
    }));

    const { startAuthentication } = await import('@simplewebauthn/browser');
    vi.mocked(startAuthentication).mockResolvedValue(mockAuthResponse as never);

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOptions),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ verified: false }),
      }) as unknown as typeof fetch;

    const { AuthProvider: Provider, useAuth: hook } = await import(
      './auth-context'
    );

    let capturedError: string | undefined;

    function TestComponent() {
      const { loginWithPasskey } = hook();
      return (
        <button
          type="button"
          onClick={() =>
            loginWithPasskey().catch(e => {
              capturedError = (e as Error).message;
            })
          }
        >
          Login
        </button>
      );
    }

    render(
      <Provider>
        <TestComponent />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(capturedError).toBe('Passkey verification failed');
    });
  });

  it('throws when login endpoint returns non-OK status', async () => {
    vi.mock('@simplewebauthn/browser', () => ({
      browserSupportsWebAuthn: () => true,
      startAuthentication: vi.fn(),
    }));

    const { startAuthentication } = await import('@simplewebauthn/browser');
    vi.mocked(startAuthentication).mockResolvedValue(mockAuthResponse as never);

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: null }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOptions),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      }) as unknown as typeof fetch;

    const { AuthProvider: Provider, useAuth: hook } = await import(
      './auth-context'
    );

    let capturedError: string | undefined;

    function TestComponent() {
      const { loginWithPasskey } = hook();
      return (
        <button
          type="button"
          onClick={() =>
            loginWithPasskey().catch(e => {
              capturedError = (e as Error).message;
            })
          }
        >
          Login
        </button>
      );
    }

    render(
      <Provider>
        <TestComponent />
      </Provider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(capturedError).toBe('Passkey login failed');
    });
  });
});
