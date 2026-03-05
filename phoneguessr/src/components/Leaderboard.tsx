import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Tab = 'daily' | 'weekly' | 'monthly' | 'all-time';

interface DailyEntry {
  rank: number;
  displayName: string;
  score: number;
  guessCount: number;
}

interface AggregateEntry {
  rank: number;
  displayName: string;
  totalWins: number;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('daily');
  const [entries, setEntries] = useState<(DailyEntry | AggregateEntry)[]>([]);
  const [loading, setLoading] = useState(true);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'daily', label: t('leaderboard.daily') },
    { key: 'weekly', label: t('leaderboard.weekly') },
    { key: 'monthly', label: t('leaderboard.monthly') },
    { key: 'all-time', label: t('leaderboard.allTime') },
  ];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard/${tab}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.entries);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
        <p className="leaderboard-empty">
          {t('leaderboard.empty')}
        </p>
      ) : (
        <div className="leaderboard-list">
          {entries.map((entry, i) => (
            <div key={i} className="leaderboard-row">
              <span className="lb-rank">#{entry.rank}</span>
              <span className="lb-name">{entry.displayName}</span>
              {'score' in entry ? (
                <>
                  <span className="lb-guesses">{entry.guessCount}/6</span>
                  <span className="lb-score">{entry.score?.toFixed(1)}s</span>
                </>
              ) : (
                <span className="lb-wins">
                  {t('leaderboard.wins', { count: (entry as AggregateEntry).totalWins })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
