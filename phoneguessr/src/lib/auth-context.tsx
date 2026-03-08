import { browserSupportsWebAuthn } from '@simplewebauthn/browser';
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
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  webAuthnSupported: false,
  login: () => {},
  logout: () => {},
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

  return (
    <AuthContext.Provider
      value={{ user, loading, webAuthnSupported, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
