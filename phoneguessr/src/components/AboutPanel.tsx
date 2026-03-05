import { useTranslation } from 'react-i18next';

export function AboutPanel() {
  const { t } = useTranslation();

  return (
    <div className="about-panel">
      <h2 className="about-title">{t('about.title')}</h2>
      <p className="about-tagline">{t('about.tagline')}</p>

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
    </div>
  );
}
