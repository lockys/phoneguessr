import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const TOTAL_STEPS = 3;
const STORAGE_KEY = 'phoneguessr_onboarded';

/** CSS selectors for each step's spotlight target */
const STEP_TARGETS = ['.crop-wrapper', '.crop-wrapper', '.guess-history'];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingProps {
  onDone: () => void;
}

export function Onboarding({ onDone }: OnboardingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const updateRect = useCallback(() => {
    const selector = STEP_TARGETS[step];
    const el = document.querySelector(selector);
    if (!el) return;
    const r = el.getBoundingClientRect();
    const padding = 8;
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [step]);

  useLayoutEffect(() => {
    updateRect();
  }, [updateRect]);

  useEffect(() => {
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect]);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    onDone();
  };

  const stepTitleKeys = [
    'onboarding.step1.title',
    'onboarding.step2.title',
    'onboarding.step3.title',
  ] as const;

  const stepDescKeys = [
    'onboarding.step1.desc',
    'onboarding.step2.desc',
    'onboarding.step3.desc',
  ] as const;

  const isLast = step === TOTAL_STEPS - 1;

  return (
    <div className="onboarding-backdrop">
      {rect && (
        <div
          className="onboarding-spotlight"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
        />
      )}

      <div className="onboarding-card">
        <div className="onboarding-step-indicator">
          {t('onboarding.stepOf', { current: step + 1, total: TOTAL_STEPS })}
        </div>

        <h3 className="onboarding-title">{t(stepTitleKeys[step])}</h3>
        <p className="onboarding-desc">{t(stepDescKeys[step])}</p>

        <div className="onboarding-progress">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`onboarding-progress-bar${i <= step ? ' onboarding-progress-active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button type="button" className="onboarding-skip" onClick={finish}>
            {t('onboarding.skip')}
          </button>
          <button
            type="button"
            className="onboarding-next"
            onClick={handleNext}
          >
            {isLast ? t('onboarding.done') : t('onboarding.next')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the user has already completed onboarding */
export function isOnboarded(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}
