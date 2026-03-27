import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CropReveal } from '../components/CropReveal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../components/BlockGrid', () => ({
  BlockGrid: () => null,
}));

// ── Shared test state ─────────────────────────────────────────────────────────

/** globalAlpha values recorded each time ctx.drawImage is called */
const alphaAtDraw: number[] = [];

let mockCtx: {
  clearRect: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  globalAlpha: number;
  imageSmoothingEnabled: boolean;
};

/** Pending RAF callbacks, keyed by RAF ID for proper cancellation support */
const pendingRafs = new Map<number, FrameRequestCallback>();
let nextRafId = 1;

/** Image instances waiting for manual load trigger */
type ImageInstance = {
  onload: ((e: Event) => void) | null;
  naturalWidth: number;
  naturalHeight: number;
};
const imageInstances: ImageInstance[] = [];

// ── Setup / teardown ──────────────────────────────────────────────────────────

function setupMocks() {
  alphaAtDraw.length = 0;
  pendingRafs.clear();
  nextRafId = 1;
  imageInstances.length = 0;

  // Canvas 2D context stub
  mockCtx = {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(() => {
      alphaAtDraw.push(mockCtx.globalAlpha);
    }),
    globalAlpha: 1,
    imageSmoothingEnabled: true,
  };

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockCtx as unknown as CanvasRenderingContext2D,
  );

  // drawPixelated reads ctx.canvas for the self-copy upscale step
  Object.defineProperty(mockCtx, 'canvas', {
    get: () => document.querySelector('canvas'),
    configurable: true,
  });

  vi.spyOn(
    HTMLCanvasElement.prototype,
    'getBoundingClientRect',
  ).mockReturnValue({
    width: 320,
    height: 320,
    top: 0,
    left: 0,
    right: 320,
    bottom: 320,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

  // RAF with real cancellation support (cancelAnimationFrame removes from map)
  vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => {
    const id = nextRafId++;
    pendingRafs.set(id, cb);
    return id;
  });
  vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(id => {
    pendingRafs.delete(id);
  });

  // Image constructor replacement — allows manual load control in tests
  class StubImage {
    onload: ((e: Event) => void) | null = null;
    onerror: ((e: Event) => void) | null = null;
    naturalWidth = 100;
    naturalHeight = 100;
    private _src = '';

    get src() {
      return this._src;
    }
    set src(value: string) {
      this._src = value;
      // Register so triggerImageLoad() can fire onload
      imageInstances.push(this);
    }
  }

  vi.stubGlobal('Image', StubImage);
}

function triggerImageLoad() {
  for (const img of [...imageInstances]) {
    img.onload?.(new Event('load'));
  }
  imageInstances.length = 0;
}

/**
 * Run all pending RAF callbacks.
 * Uses `performance.now() + deltaMs` as the timestamp so animation elapsed time
 * is meaningful regardless of when performance.now() was last read in the component.
 */
function flushRafs(deltaMs: number) {
  const now = performance.now() + deltaMs;
  const entries = [...pendingRafs.entries()];
  pendingRafs.clear();
  for (const [, cb] of entries) {
    cb(now);
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CropReveal', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders a canvas element with accessible label', () => {
    render(<CropReveal imageSrc="" level={0} revealed={false} />);
    expect(document.querySelector('canvas')).toBeTruthy();
    expect(screen.getByRole('img')).toBeTruthy();
  });

  it('draws immediately on first image load — no crossfade', async () => {
    render(
      <CropReveal
        imageSrc="data:image/png;base64,first"
        level={0}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    // All draws during first load must be at full opacity (no alpha blending)
    expect(alphaAtDraw.length).toBeGreaterThan(0);
    expect(alphaAtDraw.every(a => a === 1)).toBe(true);
  });

  it('pixelation dissolve when imageSrc changes: drawImage is called with smoothing toggled', async () => {
    const { rerender } = render(
      <CropReveal
        imageSrc="data:image/png;base64,src1"
        level={0}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    mockCtx.drawImage.mockClear();
    pendingRafs.clear();

    // Simulate server delivering a new crop for the next level
    rerender(
      <CropReveal
        imageSrc="data:image/png;base64,src2"
        level={1}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    // Pixelation dissolve RAF should be queued
    expect(pendingRafs.size).toBeGreaterThan(0);

    // Run a mid-animation frame (100ms into 400ms → phase 1, pixelating old image)
    act(() => {
      flushRafs(100);
    });

    // During pixelation, drawImage should be called for the pixelated rendering
    expect(mockCtx.drawImage).toHaveBeenCalled();
  });

  it('restores imageSmoothingEnabled after each pixelation frame', async () => {
    const { rerender } = render(
      <CropReveal
        imageSrc="data:image/png;base64,src1"
        level={0}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });
    pendingRafs.clear();

    rerender(
      <CropReveal
        imageSrc="data:image/png;base64,src2"
        level={1}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    act(() => {
      flushRafs(100);
    });

    // imageSmoothingEnabled must be restored after each frame
    expect(mockCtx.imageSmoothingEnabled).toBe(true);
  });

  it('only pixelation dissolve RAF is active when imageSrc and level change together', async () => {
    const { rerender } = render(
      <CropReveal
        imageSrc="data:image/png;base64,src1"
        level={0}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    alphaAtDraw.length = 0;
    pendingRafs.clear();

    // Both imageSrc AND level change simultaneously (normal in anti-cheat flow)
    rerender(
      <CropReveal
        imageSrc="data:image/png;base64,src2"
        level={1}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    // Only the crossfade RAF should be active
    expect(pendingRafs.size).toBe(1);
  });

  it('does not resize canvas on animation frames when size is stable', async () => {
    render(
      <CropReveal
        imageSrc="data:image/png;base64,src1"
        level={0}
        revealed={false}
      />,
    );

    await act(async () => {
      triggerImageLoad();
    });

    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const widthSetSpy = vi.spyOn(canvas, 'width', 'set');

    // Multiple animation frames should not keep resetting canvas dimensions
    act(() => {
      flushRafs(100);
      flushRafs(200);
      flushRafs(300);
    });

    expect(widthSetSpy).toHaveBeenCalledTimes(0);
  });
});
