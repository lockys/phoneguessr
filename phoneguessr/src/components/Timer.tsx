import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  running: boolean;
  onTick?: (seconds: number) => void;
}

export function Timer({ running, onTick }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!running) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    if (!startRef.current) {
      startRef.current = performance.now();
    }

    const tick = () => {
      if (!startRef.current) return;
      const now = performance.now();
      const secs = (now - startRef.current) / 1000;
      setElapsed(secs);
      onTick?.(secs);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, onTick]);

  const mins = Math.floor(elapsed / 60);
  const secs = Math.floor(elapsed % 60);
  const ms = Math.floor((elapsed % 1) * 10);

  return (
    <div className="timer">
      {mins > 0 ? `${mins}:` : ''}
      {secs.toString().padStart(mins > 0 ? 2 : 1, '0')}.{ms}s
    </div>
  );
}
