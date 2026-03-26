# PWA Icon & Install Prompt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder PWA icons with a real icon, complete manifest and iOS meta tags, and add a subtle "Add to Home Screen" banner after the user's first game.

**Architecture:** A generation script (`sharp`) produces PNG icon files committed to the repo. Static config changes update the manifest and HTML head. A new `InstallPrompt` React component handles the install banner; the `beforeinstallprompt` listener is captured early in `layout.tsx`'s `useEffect`. `Game.tsx` writes a one-line localStorage flag when any game result is saved.

**Tech Stack:** TypeScript, React 19, Modern.js/Rspack, `sharp` (already a devDependency), Vitest + @testing-library/react, Biome linter.

**Spec:** `docs/superpowers/specs/2026-03-26-pwa-icon-install-prompt-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `phoneguessr/scripts/generate-icons.ts` | Rasterize SVG → PNG at all required sizes |
| Create/overwrite | `phoneguessr/config/public/icons/icon-192x192.png` | Standard 192 icon |
| Create/overwrite | `phoneguessr/config/public/icons/icon-512x512.png` | Standard 512 icon |
| Create | `phoneguessr/config/public/icons/icon-192x192-maskable.png` | Maskable 192 (12% inset) |
| Create | `phoneguessr/config/public/icons/icon-512x512-maskable.png` | Maskable 512 (12% inset) |
| Create | `phoneguessr/config/public/icons/apple-touch-icon.png` | iOS 180×180 |
| Create | `phoneguessr/config/public/icons/favicon-32x32.png` | Browser tab 32×32 |
| Modify | `phoneguessr/config/public/manifest.json` | Add `id`, `display_override`, maskable icon entries |
| Modify | `phoneguessr/modern.config.ts` | Add Apple meta tags + favicon link to `html.tags` |
| Modify | `phoneguessr/src/components/Game.tsx` | Write `phoneguessr_install_eligible` on result save |
| Create | `phoneguessr/src/components/InstallPrompt.tsx` | Install banner component |
| Create | `phoneguessr/src/components/install-prompt.css` | Banner styles |
| Create | `phoneguessr/src/components/InstallPrompt.test.tsx` | Component unit tests |
| Modify | `phoneguessr/src/routes/layout.tsx` | Capture `beforeinstallprompt` early; mount `<InstallPrompt />` |

---

## Task 1: Generate icon PNG files

**Files:**
- Create: `phoneguessr/scripts/generate-icons.ts`
- Create/overwrite: `phoneguessr/config/public/icons/*.png` (6 files)

This task produces committed PNG artifacts. The script is a one-off build tool — no unit tests needed.

- [ ] **Step 1.1: Write the generation script**

Create `phoneguessr/scripts/generate-icons.ts`:

```ts
import sharp from 'sharp';
import { resolve } from 'node:path';

const OUT = resolve(import.meta.dirname, '../config/public/icons');

// Standard icon SVG — full bleed, designed for iOS (clips its own corners)
const svgStandard = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background -->
  <rect width="512" height="512" fill="#1a1a2e"/>
  <!-- Phone body -->
  <rect x="141" y="77" width="230" height="358" rx="36" fill="#e2e8f0"/>
  <!-- Screen -->
  <rect x="160" y="128" width="192" height="242" rx="12" fill="#0f172a"/>
  <!-- Question mark -->
  <text
    x="256" y="275"
    text-anchor="middle"
    font-size="140"
    font-weight="900"
    fill="#f59e0b"
    font-family="system-ui,-apple-system,sans-serif"
  >?</text>
  <!-- Home button -->
  <circle cx="256" cy="402" r="18" fill="#94a3b8"/>
</svg>`.trim();

// Maskable icon SVG — phone inset 12% from all edges so content stays
// inside Android's 80% safe zone circle
const svgMaskable = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background fills full canvas including padding -->
  <rect width="512" height="512" fill="#1a1a2e"/>
  <!-- Phone body (12% inset = 61px on each side, so 390px wide canvas) -->
  <rect x="176" y="118" width="160" height="276" rx="26" fill="#e2e8f0"/>
  <!-- Screen -->
  <rect x="192" y="152" width="128" height="168" rx="8" fill="#0f172a"/>
  <!-- Question mark -->
  <text
    x="256" y="262"
    text-anchor="middle"
    font-size="96"
    font-weight="900"
    fill="#f59e0b"
    font-family="system-ui,-apple-system,sans-serif"
  >?</text>
  <!-- Home button -->
  <circle cx="256" cy="368" r="13" fill="#94a3b8"/>
</svg>`.trim();

async function generate(
  svg: string,
  size: number,
  filename: string,
): Promise<void> {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(OUT, filename));
  console.log(`✓ ${filename}`);
}

await generate(svgStandard, 192, 'icon-192x192.png');
await generate(svgStandard, 512, 'icon-512x512.png');
await generate(svgStandard, 180, 'apple-touch-icon.png');
await generate(svgStandard, 32, 'favicon-32x32.png');
await generate(svgMaskable, 192, 'icon-192x192-maskable.png');
await generate(svgMaskable, 512, 'icon-512x512-maskable.png');

console.log('All icons generated.');
```

- [ ] **Step 1.2: Run the script**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx tsx scripts/generate-icons.ts
```

Expected output:
```
✓ icon-192x192.png
✓ icon-512x512.png
✓ apple-touch-icon.png
✓ favicon-32x32.png
✓ icon-192x192-maskable.png
✓ icon-512x512-maskable.png
All icons generated.
```

Verify the files exist and have non-trivial size:
```bash
ls -lh config/public/icons/
```

Expected: 6 PNG files, each at least a few KB.

- [ ] **Step 1.3: Commit**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game
git add phoneguessr/scripts/generate-icons.ts phoneguessr/config/public/icons/
git commit -m "feat(pwa): add icon generation script and real app icons"
```

---

## Task 2: Manifest + HTML head tags

**Files:**
- Modify: `phoneguessr/config/public/manifest.json`
- Modify: `phoneguessr/modern.config.ts`

No new tests needed — these are static config changes. The full test suite confirms nothing broke.

- [ ] **Step 2.1: Update `manifest.json`**

Replace the entire contents of `phoneguessr/config/public/manifest.json`:

```json
{
  "id": "/",
  "name": "PhoneGuessr",
  "short_name": "PhoneGuessr",
  "description": "Daily phone guessing game - identify phones from cropped photos",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "display_override": ["standalone", "minimal-ui"],
  "orientation": "portrait",
  "theme_color": "#1a1a2e",
  "background_color": "#1a1a2e",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-192x192-maskable.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-512x512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

- [ ] **Step 2.2: Update `modern.config.ts` html.tags**

The current `html.tags` array in `phoneguessr/modern.config.ts` has 2 entries (manifest link, theme-color). Replace the entire `html` section with the expanded version:

```ts
  html: {
    tags: [
      { tag: 'link', attrs: { rel: 'manifest', href: '/manifest.json' } },
      { tag: 'meta', attrs: { name: 'theme-color', content: '#1a1a2e' } },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
      { tag: 'meta', attrs: { name: 'apple-mobile-web-app-title', content: 'PhoneGuessr' } },
      { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' } },
      { tag: 'link', attrs: { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/favicon-32x32.png' } },
    ],
  },
```

- [ ] **Step 2.3: Lint**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx biome check modern.config.ts
```

- [ ] **Step 2.4: Run full test suite**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npm run test 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 2.5: Commit**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game
git add phoneguessr/config/public/manifest.json phoneguessr/modern.config.ts
git commit -m "feat(pwa): update manifest with id/maskable icons and add Apple/favicon meta tags"
```

---

## Task 3: Game.tsx — write install eligible flag

**Files:**
- Modify: `phoneguessr/src/components/Game.tsx`

One line added to `saveResult`. The function saves at two call sites (`saveResult(newGuesses, true)` on win, `saveResult(newGuesses, false)` on loss).

- [ ] **Step 3.1: Add the localStorage write to `saveResult`**

In `phoneguessr/src/components/Game.tsx`, find `saveResult` (around line 203). Currently:

```ts
  const saveResult = async (finalGuesses: Guess[], won: boolean) => {
    if (!puzzle) return;

    const elapsed = elapsedRef.current;

    if (user && !puzzle._mockAnswerId) {
      // Authenticated: save to database only
      await fetch('/api/result', {
        ...
      });
    } else {
      // Anonymous or mock mode: save to localStorage
      localStorage.setItem(
        `phoneguessr_${puzzle.puzzleDate}`,
        JSON.stringify({ guesses: finalGuesses, elapsed, won }),
      );
    }
  };
```

Add a single line **after** both branches (outside the if/else, before the closing `}`):

```ts
  const saveResult = async (finalGuesses: Guess[], won: boolean) => {
    if (!puzzle) return;

    const elapsed = elapsedRef.current;

    if (user && !puzzle._mockAnswerId) {
      // Authenticated: save to database only
      await fetch('/api/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puzzleId: puzzle.puzzleId,
          guessCount: finalGuesses.length,
          isWin: won,
          elapsedSeconds: elapsed,
        }),
      });
    } else {
      // Anonymous or mock mode: save to localStorage
      localStorage.setItem(
        `phoneguessr_${puzzle.puzzleDate}`,
        JSON.stringify({ guesses: finalGuesses, elapsed, won }),
      );
    }
    // Signal to InstallPrompt that the user has completed a game
    localStorage.setItem('phoneguessr_install_eligible', 'true');
  };
```

- [ ] **Step 3.2: Lint**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx biome check src/components/Game.tsx
```

- [ ] **Step 3.3: Run full test suite**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npm run test 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 3.4: Commit**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game
git add phoneguessr/src/components/Game.tsx
git commit -m "feat(pwa): write install eligible flag to localStorage on game completion"
```

---

## Task 4: InstallPrompt component + layout wiring

**Files:**
- Create: `phoneguessr/src/components/InstallPrompt.tsx`
- Create: `phoneguessr/src/components/install-prompt.css`
- Create: `phoneguessr/src/components/InstallPrompt.test.tsx`
- Modify: `phoneguessr/src/routes/layout.tsx`

- [ ] **Step 4.1: Write failing tests**

Create `phoneguessr/src/components/InstallPrompt.test.tsx`:

```tsx
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock CSS import
vi.mock('./install-prompt.css', () => ({}));

// getDeferredPrompt is exported from layout — mock it here
const mockGetDeferredPrompt = vi.fn();
vi.mock('../routes/layout', () => ({
  getDeferredPrompt: mockGetDeferredPrompt,
}));

const { InstallPrompt } = await import('./InstallPrompt');

describe('InstallPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockGetDeferredPrompt.mockReturnValue(null);
    // Default: not standalone
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('does not render when phoneguessr_install_eligible is not set', () => {
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('does not render when already dismissed', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('does not render when already in standalone mode', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({ matches: true }), // standalone = true
    });
    render(<InstallPrompt />);
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('renders Android banner when eligible and deferredPrompt available', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    expect(screen.getByText(/add phoneguessr/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /install/i })).toBeDefined();
  });

  it('clicking Install calls deferredPrompt.prompt and sets dismissed', async () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    const mockPrompt = vi.fn().mockResolvedValue({ outcome: 'accepted' });
    mockGetDeferredPrompt.mockReturnValue({ prompt: mockPrompt });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /install/i }));
    expect(mockPrompt).toHaveBeenCalledOnce();
    // Banner should hide (re-render needed for async, just check dismissed key written)
    await vi.waitFor(() => {
      expect(localStorage.getItem('phoneguessr_install_dismissed')).toBe('true');
    });
  });

  it('clicking × sets dismissed and hides banner', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue({ prompt: vi.fn() });
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: /×/ }));
    expect(localStorage.getItem('phoneguessr_install_dismissed')).toBe('true');
    expect(screen.queryByText(/add phoneguessr/i)).toBeNull();
  });

  it('renders iOS share instruction on iOS (no deferredPrompt)', () => {
    localStorage.setItem('phoneguessr_install_eligible', 'true');
    mockGetDeferredPrompt.mockReturnValue(null);
    // Simulate iOS userAgent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    });
    render(<InstallPrompt />);
    expect(screen.getByText(/add to home screen/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /install/i })).toBeNull();
    // Reset userAgent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0',
    });
  });
});
```

- [ ] **Step 4.2: Run tests — expect FAIL**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx vitest run src/components/InstallPrompt.test.tsx 2>&1 | head -20
```

Expected: failures (component doesn't exist yet).

- [ ] **Step 4.3: Create `install-prompt.css`**

Create `phoneguessr/src/components/install-prompt.css`:

```css
.install-prompt {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #161b22;
  border-top: 1px solid #30363d;
  animation: slide-up 300ms ease forwards;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.install-prompt-text {
  flex: 1;
  color: #c9d1d9;
  font-size: 14px;
  margin: 0;
}

.install-prompt-install {
  background: #1f6feb;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.install-prompt-install:hover {
  background: #388bfd;
}

.install-prompt-dismiss {
  background: none;
  border: none;
  color: #8b949e;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
}

.install-prompt-dismiss:hover {
  color: #c9d1d9;
}
```

- [ ] **Step 4.4: Create `InstallPrompt.tsx`**

Create `phoneguessr/src/components/InstallPrompt.tsx`:

```tsx
import { useEffect, useState } from 'react';
import { getDeferredPrompt } from '../routes/layout';
import './install-prompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (('standalone' in window.navigator) &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

function shouldShow(deferredPrompt: BeforeInstallPromptEvent | null): boolean {
  if (isStandalone()) return false;
  if (localStorage.getItem('phoneguessr_install_dismissed') === 'true') return false;
  if (localStorage.getItem('phoneguessr_install_eligible') !== 'true') return false;
  return deferredPrompt !== null || isIos();
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const check = () => {
      const dp = getDeferredPrompt() as BeforeInstallPromptEvent | null;
      setPrompt(dp);
      setVisible(shouldShow(dp));
    };

    check();
    window.addEventListener('focus', check);
    return () => window.removeEventListener('focus', check);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    try {
      await prompt.prompt();
    } catch {
      // ignore — hide regardless
    }
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    setVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('phoneguessr_install_dismissed', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="install-prompt" role="banner">
      {isIos() ? (
        <p className="install-prompt-text">
          📱 Tap ⎙ then &ldquo;Add to Home Screen&rdquo; to install
        </p>
      ) : (
        <>
          <p className="install-prompt-text">
            📱 Add PhoneGuessr to your home screen
          </p>
          <button
            type="button"
            className="install-prompt-install"
            onClick={handleInstall}
          >
            Install
          </button>
        </>
      )}
      <button
        type="button"
        className="install-prompt-dismiss"
        onClick={handleDismiss}
        aria-label="×"
      >
        ×
      </button>
    </div>
  );
}
```

- [ ] **Step 4.5: Update `layout.tsx` — capture prompt + mount component**

Replace the entire contents of `phoneguessr/src/routes/layout.tsx`:

```tsx
import { Outlet } from '@modern-js/runtime/router';
import { useEffect } from 'react';
import { InstallPrompt } from '../components/InstallPrompt';
import { AuthProvider } from '../lib/auth-context';
import '../i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Module-scoped so it's captured before React hydrates child components.
// The 'beforeinstallprompt' event fires early in page lifecycle.
let _deferredPrompt: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e as BeforeInstallPromptEvent;
  });
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return _deferredPrompt;
}

export default function Layout() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <div>
        <Outlet />
        <InstallPrompt />
      </div>
    </AuthProvider>
  );
}
```

- [ ] **Step 4.6: Run tests — expect all pass**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx vitest run src/components/InstallPrompt.test.tsx --reporter=verbose 2>&1 | grep -E "✓|✗|PASS|FAIL"
```

Expected: all 7 tests pass.

- [ ] **Step 4.7: Run full test suite**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npm run test 2>&1 | tail -5
```

Expected: all tests pass.

- [ ] **Step 4.8: Lint**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game/phoneguessr && npx biome check src/components/InstallPrompt.tsx src/components/install-prompt.css src/components/InstallPrompt.test.tsx src/routes/layout.tsx
```

Fix any issues.

- [ ] **Step 4.9: Commit**

```bash
cd /Users/calvinjeng/Documents/projects/guess-game
git add phoneguessr/src/components/InstallPrompt.tsx \
        phoneguessr/src/components/install-prompt.css \
        phoneguessr/src/components/InstallPrompt.test.tsx \
        phoneguessr/src/routes/layout.tsx
git commit -m "feat(pwa): add install prompt banner with iOS/Android support"
```
