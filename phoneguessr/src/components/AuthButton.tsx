import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';

export function AuthButton() {
  const { t } = useTranslation();
  const { user, loading, login, logout } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setAuthError(error);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setAuthError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return null;
  }

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
        <button type="button" className="auth-btn" onClick={logout}>
          {t('auth.signOut')}
        </button>
      </div>
    );
  }

  return (
    <>
      {authError && <span className="auth-error">{t('auth.error')}</span>}
      <button type="button" className="auth-btn auth-btn-login" onClick={login}>
        {t('auth.signIn')}
      </button>
    </>
  );
}
