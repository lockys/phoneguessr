import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';

export function AuthButton() {
  const { t } = useTranslation();
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return (
      <div className="auth-user">
        <span className="auth-name">{user.displayName}</span>
        <button type="button" className="auth-btn" onClick={logout}>
          {t('auth.signOut')}
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="auth-btn auth-btn-login" onClick={login}>
      {t('auth.signIn')}
    </button>
  );
}
