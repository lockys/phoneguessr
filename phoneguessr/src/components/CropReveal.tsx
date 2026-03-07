import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockGrid } from './BlockGrid';

interface CropRevealProps {
  imageSrc: string;
  level: number; // 0-5 (0 = tightest zoom, 5 = full)
  revealed: boolean;
  isWin?: boolean;
  onRevealComplete?: () => void;
  onImageDrawn?: () => void;
}

/**
 * Scale factors for each guess level.
 * Each wrong guess zooms out slightly, revealing more of the phone.
 */
const ZOOM_LEVELS = [
  4.17, // level 0: ~24% visible area
  2.5, // level 1: ~40% visible
  1.79, // level 2: ~56% visible
  1.39, // level 3: ~72% visible
  1.14, // level 4: ~88% visible
  1.0, // level 5: full
];

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeOutBouncy(t: number) {
  // Slight overshoot then settle — mimics the old CSS zoom-reveal-win
  if (t < 0.6) {
    return easeOutCubic(t / 0.6);
  }
  // Settle phase: go to 0.95 at 60%, then ease back to 1.0
  const settle = (t - 0.6) / 0.4;
  return 1 + 0.05 * Math.sin(settle * Math.PI);
}

function drawImageScaled(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  dpr: number,
) {
  const w = canvasWidth * dpr;
  const h = canvasHeight * dpr;
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(scale, scale);

  // Draw image covering the canvas (object-fit: cover equivalent)
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const canvasAspect = w / h;
  let drawW: number;
  let drawH: number;
  if (imgAspect > canvasAspect) {
    drawH = h;
    drawW = h * imgAspect;
  } else {
    drawW = w;
    drawH = w / imgAspect;
  }
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

export function CropReveal({
  imageSrc,
  level,
  revealed,
  isWin,
  onRevealComplete,
  onImageDrawn,
}: CropRevealProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef(0);
  const prevRevealedRef = useRef(revealed);
  const [revealAnimating, setRevealAnimating] = useState(false);
  const fromScaleRef = useRef(1);

  // Load image into offscreen Image object (never attached to DOM)
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgObjRef.current = img;
      // Initial draw at current zoom level
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const scale = revealed ? 1 : ZOOM_LEVELS[Math.min(level, 5)];
      drawImageScaled(ctx, img, rect.width, rect.height, scale, dpr);
      onImageDrawn?.();
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw on level change (gameplay zoom transitions)
  const drawAtScale = useCallback((scale: number) => {
    const canvas = canvasRef.current;
    const img = imgObjRef.current;
    if (!canvas || !img) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawImageScaled(ctx, img, rect.width, rect.height, scale, dpr);
  }, []);

  // Smooth transition between zoom levels during gameplay
  useEffect(() => {
    if (revealed || revealAnimating || !imgObjRef.current) return;
    const targetScale = ZOOM_LEVELS[Math.min(level, 5)];

    // Animate from current visual scale to target over 400ms
    const startScale = fromScaleRef.current;
    if (Math.abs(startScale - targetScale) < 0.01) {
      drawAtScale(targetScale);
      fromScaleRef.current = targetScale;
      return;
    }

    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const currentScale = startScale + (targetScale - startScale) * eased;
      drawAtScale(currentScale);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        fromScaleRef.current = targetScale;
      }
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [level, revealed, revealAnimating, drawAtScale]);

  // Detect revealed transitioning from false → true
  useEffect(() => {
    if (revealed && !prevRevealedRef.current) {
      fromScaleRef.current = ZOOM_LEVELS[Math.min(level, 5)];
      setRevealAnimating(true);
    }
    prevRevealedRef.current = revealed;
  }, [revealed, level]);

  // Reveal animation (win or loss)
  useEffect(() => {
    if (!revealAnimating || !imgObjRef.current) return;

    const duration = isWin ? 1200 : 500;
    const easeFn = isWin ? easeOutBouncy : easeOutCubic;
    const startScale = fromScaleRef.current;
    const targetScale = 1;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeFn(t);
      const currentScale = startScale + (targetScale - startScale) * eased;
      drawAtScale(currentScale);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        fromScaleRef.current = targetScale;
        setRevealAnimating(false);
        onRevealComplete?.();
      }
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [revealAnimating, isWin, onRevealComplete, drawAtScale]);

  // Draw at scale 1 when already revealed on mount (loaded from localStorage)
  useEffect(() => {
    if (revealed && !revealAnimating && imgObjRef.current) {
      drawAtScale(1);
    }
  }, [revealed, revealAnimating, drawAtScale]);

  return (
    <div className="crop-container">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={t('crop.alt')}
        className="crop-canvas"
      />
      <BlockGrid level={level} revealed={revealed} isWin={isWin} />
    </div>
  );
}
