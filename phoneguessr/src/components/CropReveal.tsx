import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZOOM_LEVELS } from '../lib/zoom-levels.js';
import { BlockGrid } from './BlockGrid';

interface CropRevealProps {
  imageSrc: string;
  level: number; // 0-5 (0 = tightest zoom, 5 = full)
  revealed: boolean;
  isWin?: boolean;
  onRevealComplete?: () => void;
  onImageDrawn?: () => void;
}

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

// Draw image centered and scaled on canvas. Does NOT clear — caller is responsible.
function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  dpr: number,
) {
  const w = canvasWidth * dpr;
  const h = canvasHeight * dpr;
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
  // True while a crossfade is running — prevents zoom animation from conflicting
  const crossfadeActiveRef = useRef(false);

  // Resize canvas only when dimensions change. Setting canvas.width/height clears the canvas,
  // so skipping unnecessary resizes prevents micro-flickers during animation.
  const ensureCanvasSize = useCallback(
    (canvas: HTMLCanvasElement, dpr: number) => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return rect;
    },
    [],
  );

  // Redraw current image at given scale (clears first)
  const drawAtScale = useCallback(
    (scale: number) => {
      const canvas = canvasRef.current;
      const img = imgObjRef.current;
      if (!canvas || !img) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = ensureCanvasSize(canvas, dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawImageOnCanvas(ctx, img, rect.width, rect.height, scale, dpr);
    },
    [ensureCanvasSize],
  );

  // Load image and crossfade from previous to new when src changes
  // level and revealed are captured intentionally at src-change time — not stale bugs
  // biome-ignore lint/correctness/useExhaustiveDependencies: level/revealed/ensureCanvasSize/onImageDrawn captured at src-change time
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const prevImg = imgObjRef.current;
      imgObjRef.current = img;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = ensureCanvasSize(canvas, dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (!prevImg) {
        // First load: draw immediately at current zoom level
        const scale = revealed ? 1 : ZOOM_LEVELS[Math.min(level, 5)];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImageOnCanvas(ctx, img, rect.width, rect.height, scale, dpr);
        fromScaleRef.current = scale;
        onImageDrawn?.();
        return;
      }

      // Subsequent load: crossfade from old to new image over 400ms
      cancelAnimationFrame(animFrameRef.current);
      crossfadeActiveRef.current = true;

      const startScale = fromScaleRef.current;
      const endScale = revealed ? 1 : ZOOM_LEVELS[Math.min(level, 5)];
      const duration = 400;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Old image fades out
        ctx.globalAlpha = 1 - eased;
        drawImageOnCanvas(
          ctx,
          prevImg,
          rect.width,
          rect.height,
          startScale,
          dpr,
        );

        // New image fades in
        ctx.globalAlpha = eased;
        drawImageOnCanvas(ctx, img, rect.width, rect.height, endScale, dpr);

        ctx.globalAlpha = 1;

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          crossfadeActiveRef.current = false;
          fromScaleRef.current = endScale;
          onImageDrawn?.();
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Smooth zoom transition between levels during gameplay
  useEffect(() => {
    // Skip if crossfade is active — it already handles the scale transition
    if (
      revealed ||
      revealAnimating ||
      !imgObjRef.current ||
      crossfadeActiveRef.current
    )
      return;
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
