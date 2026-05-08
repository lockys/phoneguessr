import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  telegramDisplayName: string | null;
  telegramAuthError: boolean;
  login: () => void;
  logout: () => void;
  loginWithTelegram: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isTelegram: false,
  telegramDisplayName: null,
  telegramAuthError: false,
  login: () => {},
  logout: () => {},
  loginWithTelegram: async () => {},
  refreshUser: async () => {},
});

const isTelegramEnv =
  typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [telegramAuthError, setTelegramAuthError] = useState(false);

  const refreshUser = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data.user ?? null);
  };

  const loginWithTelegram = useCallback(async () => {
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
  }, []);

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
            setTelegramAuthError(true);
          }
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, [loginWithTelegram]);

  const login = () => {
    window.location.href = '/api/auth/login';
  };

  const logout = () => {
    window.location.href = '/api/auth/logout';
  };

  const telegramDisplayName: string | null = isTelegramEnv
    ? (() => {
        const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
        if (!u) return null;
        return [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
      })()
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isTelegram: isTelegramEnv,
        telegramDisplayName,
        telegramAuthError,
        login,
        logout,
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
