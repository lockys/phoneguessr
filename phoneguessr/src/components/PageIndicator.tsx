import { useEffect, useRef, useState } from 'react';

interface PageIndicatorProps {
  name: string;
  show: boolean;
}

export function PageIndicator({ name, show }: PageIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [displayName, setDisplayName] = useState(name);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!show) return;

    setDisplayName(name);
    setVisible(true);

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 1500);

    return () => clearTimeout(timerRef.current);
  }, [name, show]);

  if (!show) return null;

  return (
    <div
      className={`page-indicator ${visible ? 'page-indicator-visible' : ''}`}
    >
      {displayName}
    </div>
  );
}
