import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { type StreakData, getLocalStreakData } from '../lib/streak';
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

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('phoneguessr_')) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '');
      gamesPlayed++;
      if (data.won) wins++;
    } catch {
      /* skip */
    }
  }

  const streak = getLocalStreakData();

  return {
    gamesPlayed,
    wins,
    winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
  };
}

const MILESTONE_THRESHOLDS = [
  { key: '7day', days: 7 },
  { key: '30day', days: 30 },
  { key: '100day', days: 100 },
] as const;

export function ProfilePanel() {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState(false);
  const [streakBreakDismissed, setStreakBreakDismissed] = useState(false);

  useEffect(() => {
    const streak = getLocalStreakData();
    setStreakData(streak);

    if (user) {
      setDisplayName(user.displayName || '');
      fetch('/api/profile/stats')
        .then(r => r.json())
        .then(setStats)
        .catch(() => setStats(getLocalStats()));
    } else {
      setStats(getLocalStats());
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
    } catch {
      /* mock mode - save locally */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-panel">
      <h2 className="profile-title">
        {user ? user.displayName : t('profile.yourStats')}
      </h2>

      {streakData?.streakBroken && !streakBreakDismissed && (
        <div className="streak-break-notice">
          <span>{t('streak.broken')}</span>
          <button
            type="button"
            className="streak-break-dismiss"
            onClick={() => setStreakBreakDismissed(true)}
          >
            &times;
          </button>
        </div>
      )}

      {stats ? (
        <>
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
          </div>

          <div className="streak-section">
            <h3 className="streak-section-title">{t('streak.title')}</h3>
            <div className="streak-cards">
              <div className="streak-card">
                <svg
                  className="streak-flame streak-flame-lg"
                  viewBox="0 0 16 20"
                  width="20"
                  height="24"
                  aria-hidden="true"
                >
                  <path
                    d="M8 0C8 0 2 6.5 2 12a6 6 0 0012 0c0-2-1-3.5-2-5-1 1.5-2 2-3 2 1-2 1.5-4 0-6-1 1-2.5 2.5-3 4C5 5 6 3 8 0z"
                    fill="currentColor"
                  />
                </svg>
                <span className="streak-card-value">{stats.currentStreak}</span>
                <span className="streak-card-label">{t('streak.current')}</span>
              </div>
              <div className="streak-card">
                <span className="streak-card-value streak-card-best">
                  {stats.bestStreak}
                </span>
                <span className="streak-card-label">{t('streak.best')}</span>
              </div>
            </div>
          </div>

          {streakData && (
            <div className="milestone-section">
              <h3 className="milestone-section-title">
                {t('streak.milestones')}
              </h3>
              <div className="milestone-badges">
                {MILESTONE_THRESHOLDS.map(({ key, days }) => {
                  const earned = streakData.milestones[key];
                  return (
                    <div
                      key={key}
                      className={`milestone-badge${earned ? ' milestone-badge-earned' : ''}`}
                    >
                      <span className="milestone-badge-icon">
                        {earned ? '\u2605' : '\u2606'}
                      </span>
                      <span className="milestone-badge-label">
                        {t(`streak.milestone${days}`)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="profile-loading">{t('profile.loading')}</p>
      )}

      {user && (
        <div className="profile-form">
          <div className="profile-form-field">
            <label className="profile-form-label">
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              className="profile-form-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('profile.editName')}
            />
          </div>
          <div className="profile-form-field">
            <label className="profile-form-label">
              {t('profile.language')}
            </label>
            <LanguageSelector />
          </div>
          <button
            type="button"
            className="profile-form-save"
            onClick={handleSave}
          >
            {saved ? t('profile.saved') : t('profile.save')}
          </button>
        </div>
      )}

      {!user && (
        <div className="profile-auth-prompt">
          <p>{t('profile.signInPrompt')}</p>
          <button
            type="button"
            className="auth-btn auth-btn-login"
            onClick={login}
          >
            {t('auth.signIn')}
          </button>
        </div>
      )}
    </div>
  );
}
