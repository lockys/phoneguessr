import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWebHaptics } from 'web-haptics/react';

type HintType = 'brand' | 'year' | 'price_tier';

interface RevealedHint {
  type: HintType;
  value: string;
}

interface HintButtonsProps {
  puzzleId: number;
  isMockMode: boolean;
  mockAnswerBrand?: string;
}

const MAX_HINTS = 2;
const HINT_TYPES: HintType[] = ['brand', 'year', 'price_tier'];

const MOCK_HINTS: Record<HintType, string> = {
  brand: '',
  year: '2024',
  price_tier: 'Flagship',
};

export function HintButtons({
  puzzleId,
  isMockMode,
  mockAnswerBrand,
}: HintButtonsProps) {
  const { t } = useTranslation();
  const haptic = useWebHaptics();
  const [revealed, setRevealed] = useState<RevealedHint[]>([]);
  const [loading, setLoading] = useState<HintType | null>(null);

  const hintsUsed = revealed.length;
  const isMaxed = hintsUsed >= MAX_HINTS;

  const getRevealed = (type: HintType) =>
    revealed.find(h => h.type === type)?.value;

  const labelKey: Record<HintType, string> = {
    brand: 'hint.brand',
    year: 'hint.year',
    price_tier: 'hint.price',
  };

  const requestHint = async (type: HintType) => {
    if (getRevealed(type) || isMaxed || loading) return;

    setLoading(type);

    let value: string;

    if (isMockMode) {
      value =
        type === 'brand'
          ? mockAnswerBrand || MOCK_HINTS.brand
          : MOCK_HINTS[type];
    } else {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId, hintType: type }),
      });
      const data = await res.json();
      value = data.hint;
    }

    haptic.trigger('light');
    setRevealed(prev => [...prev, { type, value }]);
    setLoading(null);
  };

  return (
    <div className="hint-row">
      <div className="hint-buttons">
        {HINT_TYPES.map(type => {
          const value = getRevealed(type);
          const isUsed = !!value;
          const disabled = isUsed || isMaxed || !!loading;

          return (
            <button
              key={type}
              type="button"
              className={`hint-pill${isUsed ? ' hint-pill-used' : ''}`}
              disabled={disabled}
              onClick={() => requestHint(type)}
            >
              {loading === type
                ? '...'
                : isUsed
                  ? `${t(labelKey[type])}: ${value}`
                  : t(labelKey[type])}
            </button>
          );
        })}
      </div>
      <div className="hint-meta">
        {hintsUsed === 0 && (
          <span className="hint-penalty">{t('hint.penaltyWarning')}</span>
        )}
        {hintsUsed > 0 && (
          <span className="hint-counter">
            {t('hint.used', { used: hintsUsed, max: MAX_HINTS })}
          </span>
        )}
      </div>
    </div>
  );
}
