import {
  browserSupportsWebAuthn,
  startAuthentication,
} from '@simplewebauthn/browser';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: number;
  displayName: string;
  avatarUrl?: string;
  email?: string | null;
  isAdmin?: boolean;
  region?: string | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isTelegram: boolean;
  webAuthnSupported: boolean;
  login: () => void;
  logout: () => void;
  loginWithPasskey: () => Promise<void>;
  loginWithTelegram: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isTelegram: false,
  webAuthnSupported: false,
  login: () => {},
  logout: () => {},
  loginWithPasskey: async () => {},
  loginWithTelegram: async () => {},
  refreshUser: async () => {},
});

const isTelegramEnv =
  typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [webAuthnSupported] = useState(() => browserSupportsWebAuthn());

  const refreshUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data.user ?? null);
  };

  const loginWithTelegram = async () => {
    const initData = window.Telegram?.WebApp?.initData;
    if (!initData) throw new Error('Not running inside Telegram');
    const res = await fetch('/api/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData }),
    });
    if (!res.ok) throw new Error('Telegram auth failed');
    // Use the response body directly instead of calling refreshUser(), because
    // Telegram's WebView (especially on Android) may not flush the Set-Cookie
    // before the next fetch fires, causing /api/auth/me to return null.
    const data = await res.json();
    setUser(data.user ?? null);
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(async data => {
        if (data.user) {
          setUser(data.user);
          setLoading(false);
        } else if (isTelegramEnv) {
          try {
            await loginWithTelegram();
          } catch {
            // silent — user stays unauthenticated
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  const loginWithPasskey = async () => {
    const optionsRes = await fetch('/api/auth/passkey/login-options', {
      method: 'POST',
    });
    if (!optionsRes.ok) throw new Error('Failed to get passkey login options');
    const options = await optionsRes.json();

    const authResponse = await startAuthentication({ optionsJSON: options });

    const loginRes = await fetch('/api/auth/passkey/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authResponse),
    });
    if (!loginRes.ok) throw new Error('Passkey login failed');
    const data = await loginRes.json();
    if (!data.verified) throw new Error('Passkey verification failed');
    setUser(data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isTelegram: isTelegramEnv,
        webAuthnSupported,
        login,
        logout,
        loginWithPasskey,
        loginWithTelegram,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
