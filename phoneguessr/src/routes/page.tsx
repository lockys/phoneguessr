import { Helmet } from '@modern-js/runtime/head';
import { useTranslation } from 'react-i18next';
import { AboutPanel } from '../components/AboutPanel';
import { AuthButton } from '../components/AuthButton';
import { Game } from '../components/Game';
import { Leaderboard } from '../components/Leaderboard';
import { ProfilePanel } from '../components/ProfilePanel';

import { SwipeContainer } from '../components/SwipeContainer';
import './index.css';

export default function Page() {
  const { t } = useTranslation();

  return (
    <div className="app">
      <Helmet>
        <title>{t('game.meta.title')}</title>
        <meta name="description" content={t('game.meta.description')} />
      </Helmet>
      <header className="app-header">
        <h1 className="app-title">{t('game.title')}</h1>
        <AuthButton />
      </header>
      <SwipeContainer>
        <ProfilePanel />
        <Game />
        <Leaderboard />
        <AboutPanel />
      </SwipeContainer>
    </div>
  );
}
