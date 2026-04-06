import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { YesterdayReveal } from './YesterdayReveal';

const VERSION = '0.1.0';
const DEV_MODE_KEY = 'phoneguessr_dev_mode';
const TAP_THRESHOLD = 3;
const TAP_WINDOW_MS = 2000;

export function AboutPanel() {
  const { t } = useTranslation();
  const tapTimes = useRef<number[]>([]);

  function handleVersionClick() {
    const now = Date.now();
    tapTimes.current = tapTimes.current
      .filter(t => now - t < TAP_WINDOW_MS)
      .concat(now);

    if (tapTimes.current.length >= TAP_THRESHOLD) {
      tapTimes.current = [];
      const enabled = localStorage.getItem(DEV_MODE_KEY) === 'true';
      if (enabled) {
        localStorage.removeItem(DEV_MODE_KEY);
        alert('Dev mode disabled');
      } else {
        localStorage.setItem(DEV_MODE_KEY, 'true');
        alert('Dev mode enabled — visit /debug-log');
      }
    }
  }

  return (
    <div className="about-panel">
      <h2 className="about-title">{t('about.title')}</h2>
      <p className="about-tagline">{t('about.tagline')}</p>

      <YesterdayReveal />

      <section className="about-section">
        <h3>{t('about.howToPlay')}</h3>
        <ol className="about-rules">
          <li>{t('about.rule1')}</li>
          <li>{t('about.rule2')}</li>
          <li>{t('about.rule3')}</li>
          <li>{t('about.rule4')}</li>
          <li>{t('about.rule5')}</li>
          <li>{t('about.rule6')}</li>
        </ol>
      </section>

      <section className="about-section">
        <h3>{t('about.scoring')}</h3>
        <p>{t('about.scoringText')}</p>
      </section>

      <section className="about-section">
        <h3>{t('about.credits')}</h3>
        <p>{t('about.createdBy')}</p>
        <p className="about-muted">{t('about.imageSource')}</p>
      </section>

      <p className="about-muted" style={{ textAlign: 'center', marginTop: '24px' }}>
        <span
          onClick={handleVersionClick}
          style={{ cursor: 'default', userSelect: 'none' }}
        >
          v{VERSION}
        </span>
      </p>
    </div>
  );
}
