import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface YesterdayData {
  phone: {
    brand: string;
    model: string;
    releaseYear?: number;
  };
  imageData?: string | null;
  facts: string[];
  stats: {
    totalPlayers: number;
    avgGuesses: number;
    winRate: number;
  };
}

export function YesterdayReveal() {
  const { t } = useTranslation();
  const [data, setData] = useState<YesterdayData | null>(null);
  const [error, setError] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/puzzle/yesterday')
      .then(r => r.json())
      .then(res => {
        if (res.error) {
          setError(true);
          return;
        }
        setData(res);
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    if (!data || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [data]);

  if (error || !data) return null;

  return (
    <div
      ref={ref}
      className={`yesterday ${visible ? 'yesterday-visible' : ''}`}
    >
      <h3>{t('yesterday.title')}</h3>

      <div className="yesterday-phone">
        {data.imageData && (
          <img
            className="yesterday-image"
            src={data.imageData}
            alt={`${data.phone.brand} ${data.phone.model}`}
          />
        )}
        <div className="yesterday-phone-info">
          <span className="yesterday-brand">{data.phone.brand}</span>
          <span className="yesterday-model">{data.phone.model}</span>
          {data.phone.releaseYear && (
            <span className="yesterday-year">{data.phone.releaseYear}</span>
          )}
        </div>
      </div>

      {data.facts.length > 0 && (
        <div className="yesterday-facts">
          <h4>{t('yesterday.funFacts')}</h4>
          <ul className="yesterday-facts-list">
            {data.facts.map(fact => (
              <li key={fact} className="yesterday-fact">
                {fact}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="yesterday-stats">
        <h4>{t('yesterday.communityStats')}</h4>
        <div className="yesterday-stats-grid">
          <div className="yesterday-stat">
            <span className="yesterday-stat-value">
              {data.stats.totalPlayers}
            </span>
            <span className="yesterday-stat-label">
              {t('yesterday.players')}
            </span>
          </div>
          <div className="yesterday-stat">
            <span className="yesterday-stat-value">{data.stats.winRate}%</span>
            <span className="yesterday-stat-label">
              {t('yesterday.winRate')}
            </span>
          </div>
          <div className="yesterday-stat">
            <span className="yesterday-stat-value">
              {data.stats.avgGuesses.toFixed(1)}
            </span>
            <span className="yesterday-stat-label">
              {t('yesterday.avgGuesses')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
