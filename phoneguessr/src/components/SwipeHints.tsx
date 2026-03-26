import { useEffect, useRef, useState } from 'react';

interface SwipeHintsProps {
  leftLabel?: string;
  rightLabel?: string;
  trigger: number; // changes on each panel switch to re-trigger fade
}

export function SwipeHints({
  leftLabel,
  rightLabel,
  trigger,
}: SwipeHintsProps) {
  const [visible, setVisible] = useState(false);
  const [initialVisible, setInitialVisible] = useState(
    () => !localStorage.getItem('phoneguessr_swipe_seen'),
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Auto-dismiss initial hint after animation completes
  useEffect(() => {
    if (!initialVisible) return;
    initialTimerRef.current = setTimeout(() => setInitialVisible(false), 4000);
    return () => clearTimeout(initialTimerRef.current);
  }, [initialVisible]);

  useEffect(() => {
    if (trigger === 0) return;
    // First swipe: permanently dismiss initial hint
    clearTimeout(initialTimerRef.current);
    setInitialVisible(false);
    localStorage.setItem('phoneguessr_swipe_seen', '1');

    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timerRef.current);
  }, [trigger]);

  if (!visible && !initialVisible) return null;

  return (
    <>
      {leftLabel && (
        <div
          className={`swipe-hint swipe-hint-left${initialVisible ? ' swipe-hint-initial' : ''}${visible && !initialVisible ? ' swipe-hint-visible' : ''}`}
        >
          &larr; {leftLabel}
        </div>
      )}
      {rightLabel && (
        <div
          className={`swipe-hint swipe-hint-right${initialVisible ? ' swipe-hint-initial' : ''}${visible && !initialVisible ? ' swipe-hint-visible' : ''}`}
        >
          {rightLabel} &rarr;
        </div>
      )}
    </>
  );
}
