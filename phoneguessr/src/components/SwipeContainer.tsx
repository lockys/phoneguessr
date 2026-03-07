import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { PageIndicator } from './PageIndicator';
import { SwipeHints } from './SwipeHints';

const PANEL_KEYS = [
  'nav.profile',
  'nav.game',
  'nav.leaderboard',
  'nav.about',
] as const;
const DEFAULT_INDEX = 1; // Game panel

interface SwipeContainerProps {
  children: ReactNode[];
}

export function SwipeContainer({ children }: SwipeContainerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
  const [swipeCount, setSwipeCount] = useState(0);
  const isInitialRef = useRef(true);
  const touchStartRef = useRef<{ x: number; index: number } | null>(null);

  // Scroll to default panel on mount
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollLeft = DEFAULT_INDEX * el.clientWidth;
    }
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(prev => {
      if (prev !== index) {
        isInitialRef.current = false;
        setSwipeCount(c => c + 1);
      }
      return index;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Require 1/3 page swipe before switching panels
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        index: Math.round(el.scrollLeft / el.clientWidth),
      };
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;

      const dx = e.changedTouches[0].clientX - start.x;
      const threshold = el.clientWidth / 3;

      // If swipe distance is less than 1/3 of page width, snap back
      if (Math.abs(dx) < threshold) {
        el.scrollTo({
          left: start.index * el.clientWidth,
          behavior: 'smooth',
        });
      }

      touchStartRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="swipe-container">
        {children.map((child, i) => (
          <div key={i} className="swipe-panel">
            {child}
          </div>
        ))}
      </div>
      <PageIndicator
        name={t(PANEL_KEYS[activeIndex] ?? 'nav.game')}
        show={!isInitialRef.current}
      />
      <SwipeHints
        leftLabel={
          PANEL_KEYS[activeIndex - 1]
            ? t(PANEL_KEYS[activeIndex - 1])
            : undefined
        }
        rightLabel={
          PANEL_KEYS[activeIndex + 1]
            ? t(PANEL_KEYS[activeIndex + 1])
            : undefined
        }
        trigger={swipeCount}
      />
    </>
  );
}
