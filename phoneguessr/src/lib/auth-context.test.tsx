import { render, screen } from '@testing-library/react';
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
