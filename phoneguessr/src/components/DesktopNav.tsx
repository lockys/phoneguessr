import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import './desktop-nav.css';

const TABS = [
  { index: 0, key: 'nav.profile' },
  { index: 1, key: 'nav.game' },
  { index: 2, key: 'nav.leaderboard' },
  { index: 3, key: 'nav.about' },
] as const;

interface DesktopNavProps {
  activeIndex: number;
  onNavigate: (i: number) => void;
}

export function DesktopNav({ activeIndex, onNavigate }: DesktopNavProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <nav className="desktop-nav">
      {TABS.map(tab => (
        <button
          key={tab.index}
          type="button"
          className={`desktop-nav-tab${activeIndex === tab.index ? ' active' : ''}`}
          onClick={() => onNavigate(tab.index)}
        >
          {t(tab.key)}
        </button>
      ))}
      {user?.isAdmin && (
        <a href="/admin" className="desktop-nav-tab desktop-nav-admin">
          {t('nav.admin')}
        </a>
      )}
    </nav>
  );
}
