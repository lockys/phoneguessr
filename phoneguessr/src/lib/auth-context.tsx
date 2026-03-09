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
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  webAuthnSupported: boolean;
  login: () => void;
  logout: () => void;
  loginWithPasskey: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  webAuthnSupported: false,
  login: () => {},
  logout: () => {},
  loginWithPasskey: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [webAuthnSupported] = useState(() => browserSupportsWebAuthn());

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        setUser(data.user);
        setLoading(false);
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
        webAuthnSupported,
        login,
        logout,
        loginWithPasskey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
