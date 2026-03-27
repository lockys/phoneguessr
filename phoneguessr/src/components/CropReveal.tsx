import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CIRCLE_RADII } from '../lib/zoom-levels';

interface CropRevealProps {
  imageSrc: string;
  level: number; // 0-5 (0 = tightest zoom, 5 = full)
  revealed: boolean;
  isWin?: boolean;
  onRevealComplete?: () => void;
}

const BLUR_SCALE = 12; // downscale factor for blur effect
const RING_WIDTH = 2; // circle border width in CSS pixels
const RING_COLOR = 'rgba(255, 255, 255, 0.45)';

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

// Draw image centered and covering the canvas (object-fit: cover).
function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
) {
  const w = canvasWidth * dpr;
  const h = canvasHeight * dpr;
  ctx.save();
  ctx.translate(w / 2, h / 2);

  const imgW = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const imgH = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  const imgAspect = imgW / imgH;
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

/**
 * Create an offscreen canvas with a blurred version of the image.
 * Uses downscale+upscale with smoothing enabled (Safari-compatible).
 */
function createBlurredCanvas(
  img: HTMLImageElement,
  w: number,
  h: number,
  dpr: number,
): HTMLCanvasElement {
  const pw = Math.round(w * dpr);
  const ph = Math.round(h * dpr);

  // Tiny canvas for downscaled version
  const smallW = Math.max(1, Math.ceil(pw / BLUR_SCALE));
  const smallH = Math.max(1, Math.ceil(ph / BLUR_SCALE));

  const tiny = document.createElement('canvas');
  tiny.width = smallW;
  tiny.height = smallH;
  const tCtx = tiny.getContext('2d')!;
  tCtx.imageSmoothingEnabled = true;
  tCtx.imageSmoothingQuality = 'medium';

  // Draw image cover-fitted into tiny canvas
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const tinyAspect = smallW / smallH;
  let drawW: number;
  let drawH: number;
  if (imgAspect > tinyAspect) {
    drawH = smallH;
    drawW = smallH * imgAspect;
  } else {
    drawW = smallW;
    drawH = smallW / imgAspect;
  }
  tCtx.drawImage(img, (smallW - drawW) / 2, (smallH - drawH) / 2, drawW, drawH);

  // Upscale to full size with smoothing → blurred result
  const blur = document.createElement('canvas');
  blur.width = pw;
  blur.height = ph;
  const bCtx = blur.getContext('2d')!;
  bCtx.imageSmoothingEnabled = true;
  bCtx.imageSmoothingQuality = 'medium';
  bCtx.drawImage(tiny, 0, 0, pw, ph);

  return blur;
}

/**
 * Draw the circle reveal composite:
 * 1. Blurred background (from pre-computed canvas)
 * 2. Sharp image clipped to circle
 * 3. Circle border ring
 */
function drawCircleReveal(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  blurCanvas: HTMLCanvasElement,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
  radiusFraction: number,
) {
  const w = canvasWidth * dpr;
  const h = canvasHeight * dpr;
  const cx = w / 2;
  const cy = h / 2;

  // Half-diagonal so fraction 1.0 covers the entire square
  const halfDiag = Math.sqrt(w * w + h * h) / 2;
  const radius = halfDiag * radiusFraction;

  // 1. Draw blurred background
  ctx.drawImage(blurCanvas, 0, 0, w, h);

  // 2. Sharp image clipped to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  drawImageOnCanvas(ctx, img, canvasWidth, canvasHeight, dpr);
  ctx.restore();

  // 3. Circle border ring
  if (radiusFraction < 1.0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = RING_COLOR;
    ctx.lineWidth = RING_WIDTH * dpr;
    ctx.stroke();
    ctx.restore();
  }
}

function getRadiusForLevel(level: number): number {
  const clamped = Math.min(Math.max(level, 0), CIRCLE_RADII.length - 1);
  return CIRCLE_RADII[clamped];
}

export function CropReveal({
  imageSrc,
  level,
  revealed,
  isWin,
  onRevealComplete,
}: CropRevealProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);
  const blurCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef(0);
  const prevRevealedRef = useRef(revealed);
  const currentRadiusRef = useRef(getRadiusForLevel(level));
  const [revealAnimating, setRevealAnimating] = useState(false);

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

  // Redraw current image sharp (no blur/circle) for revealed state
  const drawAtScale = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgObjRef.current;
    if (!canvas || !img) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = ensureCanvasSize(canvas, dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageOnCanvas(ctx, img, rect.width, rect.height, dpr);
  }, [ensureCanvasSize]);

  // Load image, create blur canvas, and draw or animate transition
  // biome-ignore lint/correctness/useExhaustiveDependencies: level/revealed/ensureCanvasSize captured at src-change time
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const prevImg = imgObjRef.current;
      imgObjRef.current = img;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = ensureCanvasSize(canvas, dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Create pre-computed blur canvas
      const blurCanvas = createBlurredCanvas(img, rect.width, rect.height, dpr);
      blurCanvasRef.current = blurCanvas;

      if (!prevImg) {
        // First load: draw circle reveal at current level
        const targetRadius = getRadiusForLevel(level);
        currentRadiusRef.current = targetRadius;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCircleReveal(
          ctx,
          img,
          blurCanvas,
          rect.width,
          rect.height,
          dpr,
          targetRadius,
        );
        return;
      }

      // Subsequent load: animate circle from old radius to new
      cancelAnimationFrame(animFrameRef.current);

      const startRadius = currentRadiusRef.current;
      const endRadius = getRadiusForLevel(level);
      const duration = 400;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);
        const r = startRadius + (endRadius - startRadius) * eased;
        currentRadiusRef.current = r;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCircleReveal(ctx, img, blurCanvas, rect.width, rect.height, dpr, r);

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    };
    img.src = imageSrc;
    return () => {
      img.onload = null;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [imageSrc]);

  // Animate circle radius when level changes (without image src change)
  // biome-ignore lint/correctness/useExhaustiveDependencies: ensureCanvasSize is stable
  useEffect(() => {
    const img = imgObjRef.current;
    const blurCanvas = blurCanvasRef.current;
    const canvas = canvasRef.current;
    if (!img || !blurCanvas || !canvas || revealed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = ensureCanvasSize(canvas, dpr);

    cancelAnimationFrame(animFrameRef.current);

    const startRadius = currentRadiusRef.current;
    const endRadius = getRadiusForLevel(level);

    if (Math.abs(startRadius - endRadius) < 0.001) return;

    const duration = 400;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const r = startRadius + (endRadius - startRadius) * eased;
      currentRadiusRef.current = r;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawCircleReveal(ctx, img, blurCanvas, rect.width, rect.height, dpr, r);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [level, revealed]);

  // Detect revealed transitioning from false → true
  useEffect(() => {
    if (revealed && !prevRevealedRef.current) {
      setRevealAnimating(true);
    }
    prevRevealedRef.current = revealed;
  }, [revealed]);

  // Reveal animation: circle expands to full coverage
  useEffect(() => {
    if (!revealAnimating || !imgObjRef.current) return;

    const img = imgObjRef.current;
    const blurCanvas = blurCanvasRef.current;
    const duration = isWin ? 1200 : 500;
    const startRadius = currentRadiusRef.current;
    const endRadius = 1.0;
    const startTime = performance.now();

    const animate = (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = ensureCanvasSize(canvas, dpr);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(t);
      const r = startRadius + (endRadius - startRadius) * eased;
      currentRadiusRef.current = r;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (blurCanvas && r < 1.0) {
        drawCircleReveal(ctx, img, blurCanvas, rect.width, rect.height, dpr, r);
      } else {
        drawImageOnCanvas(ctx, img, rect.width, rect.height, dpr);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setRevealAnimating(false);
        onRevealComplete?.();
      }
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [revealAnimating, isWin, onRevealComplete, ensureCanvasSize]);

  // Draw sharp when already revealed on mount
  useEffect(() => {
    if (revealed && !revealAnimating && imgObjRef.current) {
      drawAtScale();
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
    </div>
  );
}
