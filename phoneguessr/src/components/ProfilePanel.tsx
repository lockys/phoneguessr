import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { LanguageSelector } from './LanguageSelector';

interface Stats {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

function getLocalStats(): Stats {
  let gamesPlayed = 0;
  let wins = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  // Collect all game dates and results
  const results: { date: string; won: boolean }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('phoneguessr_')) continue;
    const date = key.replace('phoneguessr_', '');
    try {
      const data = JSON.parse(localStorage.getItem(key) || '');
      results.push({ date, won: !!data.won });
    } catch { /* skip */ }
  }

  results.sort((a, b) => b.date.localeCompare(a.date));
  gamesPlayed = results.length;
  wins = results.filter(r => r.won).length;

  // Current streak (consecutive wins from most recent)
  for (const r of results) {
    if (r.won) currentStreak++;
    else break;
  }

  // Best streak
  let streak = 0;
  for (const r of results) {
    if (r.won) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  return {
    gamesPlayed,
    wins,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    currentStreak,
    bestStreak,
  };
}

export function ProfilePanel() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/profile/stats')
        .then(r => r.json())
        .then(setStats)
        .catch(() => setStats(getLocalStats()));
    } else {
      setStats(getLocalStats());
    }
  }, [user]);

  return (
    <div className="profile-panel">
      <h2 className="profile-title">
        {user ? user.displayName : t('profile.yourStats')}
      </h2>

      {stats ? (
        <div className="profile-stats">
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.gamesPlayed}</span>
            <span className="profile-stat-label">{t('profile.played')}</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.wins}</span>
            <span className="profile-stat-label">{t('profile.wins')}</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.winRate}%</span>
            <span className="profile-stat-label">{t('profile.winRate')}</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.currentStreak}</span>
            <span className="profile-stat-label">{t('profile.streak')}</span>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-value">{stats.bestStreak}</span>
            <span className="profile-stat-label">{t('profile.best')}</span>
          </div>
        </div>
      ) : (
        <p className="profile-loading">{t('profile.loading')}</p>
      )}

      {!user && (
        <div className="profile-auth-prompt">
          <p>{t('profile.signInPrompt')}</p>
          <button type="button" className="auth-btn auth-btn-login" onClick={login}>
            {t('auth.signIn')}
          </button>
        </div>
      )}

      <div className="profile-lang">
        <LanguageSelector />
      </div>
    </div>
  );
}
