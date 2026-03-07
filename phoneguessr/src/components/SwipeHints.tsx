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
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (trigger === 0) return; // don't show on initial render
    setVisible(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timerRef.current);
  }, [trigger]);

  if (!visible) return null;

  return (
    <>
      {leftLabel && (
        <div
          className={`swipe-hint swipe-hint-left ${visible ? 'swipe-hint-visible' : ''}`}
        >
          &larr; {leftLabel}
        </div>
      )}
      {rightLabel && (
        <div
          className={`swipe-hint swipe-hint-right ${visible ? 'swipe-hint-visible' : ''}`}
        >
          {rightLabel} &rarr;
        </div>
      )}
    </>
  );
}
