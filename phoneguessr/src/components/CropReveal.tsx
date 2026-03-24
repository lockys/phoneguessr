import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BlockGrid } from './BlockGrid';

interface CropRevealProps {
  imageSrc: string;
  level: number; // 0-5 (0 = tightest zoom, 5 = full)
  revealed: boolean;
  isWin?: boolean;
  onRevealComplete?: () => void;
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

// Draw image centered and covering the canvas (object-fit: cover). Does NOT clear — caller is responsible.
function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  canvasWidth: number,
  canvasHeight: number,
  dpr: number,
) {
  const w = canvasWidth * dpr;
  const h = canvasHeight * dpr;
  ctx.save();
  ctx.translate(w / 2, h / 2);

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
}: CropRevealProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgObjRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef(0);
  const prevRevealedRef = useRef(revealed);
  const [revealAnimating, setRevealAnimating] = useState(false);

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

  // Redraw current image at scale 1 (clears first)
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

  // Load image and crossfade from previous to new when src changes
  // level and revealed are captured intentionally at src-change time — not stale bugs
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

      if (!prevImg) {
        // First load: draw immediately at scale 1 (server provides correctly cropped region)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawImageOnCanvas(ctx, img, rect.width, rect.height, dpr);
        return;
      }

      // Subsequent load: crossfade from old to new image over 400ms
      cancelAnimationFrame(animFrameRef.current);

      const duration = 400;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(t);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Old image fades out
        ctx.globalAlpha = 1 - eased;
        drawImageOnCanvas(ctx, prevImg, rect.width, rect.height, dpr);

        // New image fades in
        ctx.globalAlpha = eased;
        drawImageOnCanvas(ctx, img, rect.width, rect.height, dpr);

        ctx.globalAlpha = 1;

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

  // Detect revealed transitioning from false → true
  useEffect(() => {
    if (revealed && !prevRevealedRef.current) {
      setRevealAnimating(true);
    }
    prevRevealedRef.current = revealed;
  }, [revealed]);

  // Reveal animation (win or loss)
  useEffect(() => {
    if (!revealAnimating || !imgObjRef.current) return;

    const duration = isWin ? 1200 : 500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      drawAtScale();
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
  }, [revealAnimating, isWin, onRevealComplete, drawAtScale]);

  // Draw at scale 1 when already revealed on mount (loaded from localStorage)
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
      <BlockGrid level={level} revealed={revealed} isWin={isWin} />
    </div>
  );
}
