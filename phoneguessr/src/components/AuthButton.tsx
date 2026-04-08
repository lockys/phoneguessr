import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';

export function AuthButton() {
  const { t } = useTranslation();
  const {
    user,
    loading,
    isTelegram,
    telegramDisplayName,
    login,
    logout,
    webAuthnSupported,
    loginWithPasskey,
  } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setAuthError(error);
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setAuthError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    try {
      await loginWithPasskey();
    } catch (err) {
      setPasskeyError(
        err instanceof Error ? err.message : 'Passkey login failed',
      );
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  // Authenticated user (any provider)
  if (user) {
    return (
      <div className="auth-user">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt=""
            className="auth-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="auth-name">{user.displayName}</span>
        {!isTelegram && (
          <button type="button" className="auth-btn" onClick={logout}>
            {t('auth.signOut')}
          </button>
        )}
      </div>
    );
  }

  // In Telegram: show optimistic name from initDataUnsafe while server auth runs
  if (isTelegram) {
    if (!telegramDisplayName) return null;
    return (
      <div className="auth-user">
        <span className="auth-name">{telegramDisplayName}</span>
      </div>
    );
  }

  // Web: show sign-in button
  return (
    <>
      {authError && <span className="auth-error">{t('auth.error')}</span>}
      {webAuthnSupported && (
        <button
          type="button"
          className="auth-btn auth-btn-passkey"
          onClick={handlePasskeyLogin}
          disabled={passkeyLoading}
        >
          {passkeyLoading ? 'Signing in...' : 'Sign in with Passkey'}
        </button>
      )}
      {passkeyError && <span className="auth-error">{passkeyError}</span>}
      <button type="button" className="auth-btn auth-btn-login" onClick={login}>
        {t('auth.signIn')}
      </button>
    </>
  );
}
