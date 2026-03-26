import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { GuessDistribution } from './GuessDistribution';
import { LanguageSelector } from './LanguageSelector';

interface Stats {
  gamesPlayed: number;
  wins: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
}

interface HistoryEntry {
  puzzleDate: string;
  puzzleNumber: number;
  isWin: boolean;
  guessCount: number;
  score: number | null;
  phoneBrand: string;
  phoneModel: string;
}

function getLocalStats(): Stats {
  let gamesPlayed = 0;
  let wins = 0;
  let currentStreak = 0;
  let bestStreak = 0;

  const results: { date: string; won: boolean }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('phoneguessr_')) continue;
    const date = key.replace('phoneguessr_', '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key) || '');
      results.push({ date, won: !!data.won });
    } catch {
      /* skip */
    }
  }

  results.sort((a, b) => b.date.localeCompare(a.date));
  gamesPlayed = results.length;
  wins = results.filter(r => r.won).length;

  for (const r of results) {
    if (r.won) currentStreak++;
    else break;
  }

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
  const { user, login, refreshUser } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      fetch('/api/profile/stats')
        .then(r => r.json())
        .then(setStats)
        .catch(() => setStats(getLocalStats()));

      fetch('/api/profile/history?limit=10')
        .then(r => r.json())
        .then(data => {
          setHistory(data.results || []);
          setHistoryTotal(data.total || 0);
        })
        .catch(() => {});
    } else {
      setStats(getLocalStats());
    }
  }, [user]);

  const loadMore = useCallback(() => {
    if (historyLoading || history.length >= historyTotal) return;
    setHistoryLoading(true);
    fetch(`/api/profile/history?limit=10&offset=${history.length}`)
      .then(r => r.json())
      .then(data => {
        setHistory(prev => [...prev, ...(data.results || [])]);
        setHistoryTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [history.length, historyTotal, historyLoading]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      if (res.ok) {
        await refreshUser();
      }
    } catch {
      /* mock mode - save locally */
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="profile-panel">
      {user ? (
        <div className="profile-user-card">
          {user.avatarUrl && (
            <img
              src={user.avatarUrl}
              alt=""
              className="profile-avatar"
              referrerPolicy="no-referrer"
            />
          )}
          <div className="profile-user-info">
            <h2 className="profile-title">{user.displayName}</h2>
            <span className="profile-email">
              {user.email || t('profile.emailNotAvailable')}
            </span>
          </div>
        </div>
      ) : (
        <h2 className="profile-title">{t('profile.yourStats')}</h2>
      )}

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

      <GuessDistribution />

      {user && (
        <div className="profile-form">
          <div className="profile-form-field">
            <label className="profile-form-label" htmlFor="profile-name">
              {t('profile.displayName')}
            </label>
            <input
              id="profile-name"
              type="text"
              className="profile-form-input"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder={t('profile.editName')}
            />
          </div>
          <div className="profile-form-field">
            <label className="profile-form-label" htmlFor="profile-lang">
              {t('profile.language')}
            </label>
            <LanguageSelector id="profile-lang" />
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

      {user && (
        <div className="profile-history">
          <h3 className="profile-history-title">{t('profile.gameHistory')}</h3>
          {history.length === 0 ? (
            <p className="profile-history-empty">{t('profile.noGamesYet')}</p>
          ) : (
            <>
              <div className="profile-history-list">
                {history.map(entry => (
                  <div
                    key={`${entry.puzzleDate}-${entry.puzzleNumber}`}
                    className="profile-history-row"
                  >
                    <div className="profile-history-date">
                      <span className="profile-history-puzzle-num">
                        {t('profile.puzzleNum', { num: entry.puzzleNumber })}
                      </span>
                      <span className="profile-history-puzzle-date">
                        {entry.puzzleDate}
                      </span>
                    </div>
                    <span
                      className={`profile-history-result ${entry.isWin ? 'win' : 'loss'}`}
                    >
                      {entry.isWin ? '✓' : '✗'}
                    </span>
                    <span className="profile-history-guesses">
                      {entry.guessCount}/6
                    </span>
                    <span className="profile-history-phone">
                      {entry.phoneBrand} {entry.phoneModel}
                    </span>
                  </div>
                ))}
              </div>
              {history.length < historyTotal && (
                <button
                  type="button"
                  className="profile-history-load-more"
                  onClick={loadMore}
                  disabled={historyLoading}
                >
                  {historyLoading
                    ? t('profile.loading')
                    : t('profile.loadMore')}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {user?.isAdmin && (
        <div className="admin-panel">
          <h3 className="admin-panel-title">Admin — Reset Today's Game</h3>
          <div className="admin-reset-row">
            <input
              type="email"
              className="profile-form-input"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              placeholder="user@example.com"
            />
            <button
              type="button"
              className="admin-reset-btn"
              disabled={!resetEmail}
              onClick={async () => {
                setResetStatus('idle');
                const res = await fetch('/api/admin/reset?action=reset-today', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: resetEmail }),
                });
                setResetStatus(res.ok ? 'ok' : 'err');
                if (res.ok) setResetEmail('');
                setTimeout(() => setResetStatus('idle'), 3000);
              }}
            >
              Reset
            </button>
          </div>
          {resetStatus === 'ok' && (
            <p className="admin-reset-msg ok">
              Done — user can play again today.
            </p>
          )}
          {resetStatus === 'err' && (
            <p className="admin-reset-msg err">
              Failed — user not found or server error.
            </p>
          )}
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
