import { Helmet } from '@modern-js/runtime/head';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AboutPanel } from '../components/AboutPanel';
import { AuthButton } from '../components/AuthButton';
import { DesktopNav } from '../components/DesktopNav';
import { Game } from '../components/Game';
import { Leaderboard } from '../components/Leaderboard';
import { ProfilePanel } from '../components/ProfilePanel';

import { SwipeContainer } from '../components/SwipeContainer';
import './index.css';

export default function Page() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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
      <DesktopNav activeIndex={activeIndex} onNavigate={setActiveIndex} />
      <SwipeContainer
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        disableSwipe={isDesktop}
      >
        <ProfilePanel />
        <Game />
        <Leaderboard />
        <AboutPanel />
      </SwipeContainer>
    </div>
  );
}
