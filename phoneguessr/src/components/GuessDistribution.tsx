import { useTranslation } from 'react-i18next';

interface GuessDistributionProps {
  currentGuessCount?: number;
}

interface GameResult {
  guesses: unknown[];
  won: boolean;
}

function getDistribution(): number[] {
  const counts = [0, 0, 0, 0, 0, 0]; // index 0 = 1 guess, index 5 = 6 guesses
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith('phoneguessr_')) continue;
    const dateStr = key.replace('phoneguessr_', '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;
    try {
      const data: GameResult = JSON.parse(localStorage.getItem(key) || '');
      if (data.won && Array.isArray(data.guesses)) {
        const idx = data.guesses.length - 1;
        if (idx >= 0 && idx < 6) {
          counts[idx]++;
        }
      }
    } catch {
      /* skip invalid entries */
    }
  }
  return counts;
}

export function GuessDistribution({
  currentGuessCount,
}: GuessDistributionProps) {
  const { t } = useTranslation();
  const distribution = getDistribution();
  const maxCount = Math.max(...distribution, 1);
  const hasData = distribution.some(c => c > 0);

  if (!hasData) {
    return (
      <div className="guess-distribution">
        <h3 className="guess-distribution-title">
          {t('profile.guessDistribution')}
        </h3>
        <p className="guess-distribution-empty">{t('profile.noDataYet')}</p>
      </div>
    );
  }

  return (
    <div className="guess-distribution">
      <h3 className="guess-distribution-title">
        {t('profile.guessDistribution')}
      </h3>
      <div className="guess-distribution-chart">
        {distribution.map((count, i) => {
          const guessNum = i + 1;
          const isHighlighted = currentGuessCount === guessNum;
          const widthPct =
            count > 0 ? Math.max((count / maxCount) * 100, 8) : 0;

          return (
            <div key={guessNum} className="guess-distribution-row">
              <span className="guess-distribution-label">{guessNum}</span>
              <div className="guess-distribution-bar-track">
                {count > 0 ? (
                  <div
                    className={`guess-distribution-bar${isHighlighted ? ' guess-distribution-bar-current' : ''}`}
                    style={{ width: `${widthPct}%` }}
                  >
                    <span className="guess-distribution-count">{count}</span>
                  </div>
                ) : (
                  <div
                    className="guess-distribution-bar guess-distribution-bar-zero"
                    style={{ width: '4px' }}
                  >
                    <span className="guess-distribution-count">0</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
