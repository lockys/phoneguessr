import { countryCodeToFlag } from '@/lib/region';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Tab = 'daily' | 'weekly' | 'all-time';

interface DailyEntry {
  rank: number;
  displayName: string;
  region: string | null;
  score: number;
  guessCount: number;
  avatarUrl: string | null;
}

interface AggregateEntry {
  rank: number;
  displayName: string;
  region: string | null;
  totalWins: number;
  avatarUrl: string | null;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('daily');
  const [entries, setEntries] = useState<(DailyEntry | AggregateEntry)[]>([]);
  const [loading, setLoading] = useState(true);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'daily', label: t('leaderboard.daily') },
    { key: 'weekly', label: t('leaderboard.weekly') },
    { key: 'all-time', label: t('leaderboard.allTime') },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard/${tab}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  }, [tab]);

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">{t('leaderboard.title')}</h2>
      <div className="leaderboard-tabs">
        {TABS.map(tabItem => (
          <button
            key={tabItem.key}
            type="button"
            className={`leaderboard-tab ${tab === tabItem.key ? 'active' : ''}`}
            onClick={() => setTab(tabItem.key)}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="leaderboard-empty">{t('leaderboard.loading')}</p>
      ) : entries.length === 0 ? (
        <p className="leaderboard-empty">{t('leaderboard.empty')}</p>
      ) : (
        <div className="leaderboard-list">
          {entries.map(entry => (
            <div key={entry.rank} className="leaderboard-row">
              <span className="lb-rank">
                {tab === 'all-time' && entry.rank === 1
                  ? '🏆'
                  : tab === 'all-time' && entry.rank === 2
                    ? '🥈'
                    : tab === 'all-time' && entry.rank === 3
                      ? '🥉'
                      : `#${entry.rank}`}
              </span>
              <span className="lb-name">
                {countryCodeToFlag(entry.region)
                  ? `${countryCodeToFlag(entry.region)} `
                  : ''}
                {entry.displayName}
                {tab === 'all-time' && entry.rank === 1 && (
                  <span className="lb-title"> · {t('leaderboard.title1')}</span>
                )}
                {tab === 'all-time' && entry.rank === 2 && (
                  <span className="lb-title"> · {t('leaderboard.title2')}</span>
                )}
                {tab === 'all-time' && entry.rank === 3 && (
                  <span className="lb-title"> · {t('leaderboard.title3')}</span>
                )}
              </span>
              {'score' in entry ? (
                <>
                  <span className="lb-guesses">{entry.guessCount}/6</span>
                  <span className="lb-score">{entry.score?.toFixed(1)}s</span>
                </>
              ) : (
                <span className="lb-wins">
                  {t('leaderboard.wins', {
                    count: (entry as AggregateEntry).totalWins,
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
