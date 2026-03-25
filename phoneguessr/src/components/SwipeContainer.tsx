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

// A flick faster than this (px/ms) triggers a page turn regardless of distance
const VELOCITY_THRESHOLD = 0.3;
// A slow drag past this fraction of page width triggers a page turn
const DIST_THRESHOLD = 0.25;

interface SwipeContainerProps {
  children: ReactNode[];
}

export function SwipeContainer({ children }: SwipeContainerProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
  const activeIndexRef = useRef(DEFAULT_INDEX);
  activeIndexRef.current = activeIndex;

  const [swipeCount, setSwipeCount] = useState(0);
  const isInitialRef = useRef(true);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    index: number;
  } | null>(null);
  const lastMoveRef = useRef<{ x: number; time: number } | null>(null);
  // null = undecided, true = horizontal swipe, false = vertical scroll
  const isHorizontalRef = useRef<boolean | null>(null);

  // Move track to a position without animation (during drag or initial placement)
  const setTrackX = useCallback((px: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = 'none';
    track.style.transform = `translateX(${px}px)`;
  }, []);

  // Snap track to a panel index with a duration driven by swipe velocity
  const snapTo = useCallback(
    (fromPx: number, toIndex: number, speed: number) => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;
      const width = container.clientWidth;
      const toPx = -toIndex * width;
      const dist = Math.abs(toPx - fromPx);
      // Duration: faster swipe → shorter snap animation, clamped 120–380ms
      const duration = Math.max(
        120,
        Math.min(380, dist / Math.max(speed, 0.5)),
      );
      track.style.transition = `transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)`;
      track.style.transform = `translateX(${toPx}px)`;
    },
    [],
  );

  // Set initial position without animation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setTrackX(-DEFAULT_INDEX * container.clientWidth);
  }, [setTrackX]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const index = activeIndexRef.current;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
        index,
      };
      lastMoveRef.current = null;
      isHorizontalRef.current = null;
      // Freeze position at current index, no transition
      setTrackX(-index * el.clientWidth);
    };

    const onTouchMove = (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;

      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      const dx = x - start.x;
      const dy = y - start.y;

      // Determine swipe direction on first move
      if (isHorizontalRef.current === null) {
        isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
      }

      // Vertical scroll within a panel — don't move the track
      if (!isHorizontalRef.current) return;

      lastMoveRef.current = { x, time: Date.now() };
      setTrackX(-start.index * el.clientWidth + dx);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      if (!start) return;

      // Vertical swipe — reset and let the panel handle its own scroll
      if (!isHorizontalRef.current) {
        touchStartRef.current = null;
        isHorizontalRef.current = null;
        return;
      }

      const endX = e.changedTouches[0].clientX;
      const endTime = Date.now();
      const dx = endX - start.x;
      const width = el.clientWidth;

      // Velocity from the most recent move event (accurate for flicks)
      const last = lastMoveRef.current;
      const velX =
        last && endTime - last.time < 80
          ? (endX - last.x) / Math.max(endTime - last.time, 1)
          : dx / Math.max(endTime - start.time, 1);

      const shouldSwitch =
        Math.abs(dx) > width * DIST_THRESHOLD ||
        Math.abs(velX) > VELOCITY_THRESHOLD;

      const dir = dx < 0 ? 1 : -1;
      const target = shouldSwitch
        ? Math.max(0, Math.min(children.length - 1, start.index + dir))
        : start.index;

      const fromPx = -start.index * width + dx;
      snapTo(fromPx, target, Math.abs(velX));

      if (target !== start.index) {
        isInitialRef.current = false;
        setActiveIndex(target);
        setSwipeCount(c => c + 1);
      }

      touchStartRef.current = null;
      lastMoveRef.current = null;
      isHorizontalRef.current = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [children.length, setTrackX, snapTo]);

  return (
    <>
      <div ref={containerRef} className="swipe-container">
        <div ref={trackRef} className="swipe-track">
          {children.map((child, i) => (
            <div key={i} className="swipe-panel">
              {child}
            </div>
          ))}
        </div>
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
