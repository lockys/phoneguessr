import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!show || firedRef.current) return;
    firedRef.current = true;

    const duration = 600;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#e94560', '#4ade80', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#e94560', '#4ade80', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [show]);

  return null;
}
