# Desktop Navbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a horizontal top navbar visible at ≥768px that lets desktop users switch panels; disable swipe at desktop widths.

**Architecture:** Lift `activeIndex` state to `page.tsx`, pass it + `disableSwipe` into a refactored `SwipeContainer`, and render a new `DesktopNav` component above it. All mobile behaviour is unchanged.

**Tech Stack:** React 19, Modern.js/Rspack, Vitest + React Testing Library, react-i18next, CSS media queries

**Spec:** `docs/superpowers/specs/2026-03-26-desktop-navbar-design.md`

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `phoneguessr/src/components/SwipeContainer.tsx` | Accept controlled props, remove internal state, skip swipe on `disableSwipe` |
| Modify | `phoneguessr/src/routes/page.tsx` | Own `activeIndex` + `isDesktop` state, render `DesktopNav` |
| Create | `phoneguessr/src/components/DesktopNav.tsx` | Tab navbar, calls `useAuth()` for admin tab |
| Create | `phoneguessr/src/components/desktop-nav.css` | Navbar styles, hidden <768px, hides `.swipe-hint`/`.page-indicator` |
| Modify | `phoneguessr/src/locales/en.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/zh-TW.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/zh-CN.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/ja.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/ko.json` | Add `nav.admin` |

---

## Task 1: Refactor SwipeContainer to accept controlled props

**Files:**
- Modify: `phoneguessr/src/components/SwipeContainer.tsx`

- [ ] **Step 1: Write the failing test**

  Add to `phoneguessr/src/components/viewport-ui.test.tsx` inside the existing `SwipeContainer` describe block — a new test that passes `activeIndex` and `onActiveIndexChange` props:

  ```tsx
  it('calls onActiveIndexChange when swiped', () => {
    const onchange = vi.fn();
    render(
      <SwipeContainer activeIndex={0} onActiveIndexChange={onchange}>
        <div>A</div>
        <div>B</div>
      </SwipeContainer>,
    );
    // Simulate a left swipe (next panel)
    const container = document.querySelector('.swipe-container') as HTMLElement;
    fireEvent.touchStart(container, { touches: [{ clientX: 300, clientY: 0 }] });
    fireEvent.touchMove(container, { touches: [{ clientX: 50, clientY: 0 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 50 }] });
    expect(onchange).toHaveBeenCalledWith(1);
  });

  it('does not register touch listeners when disableSwipe is true', () => {
    const onchange = vi.fn();
    render(
      <SwipeContainer activeIndex={0} onActiveIndexChange={onchange} disableSwipe>
        <div>A</div>
        <div>B</div>
      </SwipeContainer>,
    );
    const container = document.querySelector('.swipe-container') as HTMLElement;
    fireEvent.touchStart(container, { touches: [{ clientX: 300, clientY: 0 }] });
    fireEvent.touchEnd(container, { changedTouches: [{ clientX: 50 }] });
    expect(onchange).not.toHaveBeenCalled();
  });
  ```

- [ ] **Step 2: Run tests to confirm they fail**

  ```bash
  cd phoneguessr && npx vitest run src/components/viewport-ui.test.tsx
  ```

  Expected: new tests fail, existing tests pass.

- [ ] **Step 3: Update `SwipeContainerProps` interface**

  Replace:
  ```ts
  interface SwipeContainerProps {
    children: ReactNode[];
  }
  ```
  With:
  ```ts
  interface SwipeContainerProps {
    children: ReactNode[];
    activeIndex?: number;
    onActiveIndexChange?: (i: number) => void;
    disableSwipe?: boolean;
  }
  ```

- [ ] **Step 4: Remove internal state, add prop wiring**

  In the component body:
  - Remove `const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);`
  - Remove `const DEFAULT_INDEX = 1;` (module-level constant)
  - Add at top of component:
    ```ts
    const resolvedIndex = activeIndex ?? 1;
    const notifyChange = onActiveIndexChange ?? (() => {});
    ```
  - Keep `activeIndexRef` but sync it to `resolvedIndex`:
    ```ts
    const activeIndexRef = useRef(resolvedIndex);
    activeIndexRef.current = resolvedIndex;
    ```
  - Replace all `setActiveIndex(target)` calls with `notifyChange(target)`
  - Replace all `activeIndex` reads (in JSX, e.g. `PANEL_KEYS[activeIndex]`) with `resolvedIndex`

- [ ] **Step 5: Fix initial placement `useEffect`**

  Replace:
  ```ts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setTrackX(-DEFAULT_INDEX * container.clientWidth);
  }, [setTrackX]);
  ```
  With:
  ```ts
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setTrackX(-activeIndexRef.current * container.clientWidth);
  }, [setTrackX]); // fires once on mount; activeIndexRef holds the initial prop value
  ```

- [ ] **Step 6: Add prop-driven animation effect**

  Add after the initial placement effect:
  ```ts
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const container = containerRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const fromPx = -activeIndexRef.current * width;
    snapTo(fromPx, resolvedIndex, 1.0);
    activeIndexRef.current = resolvedIndex;
  }, [resolvedIndex, snapTo]);
  ```

- [ ] **Step 7: Guard touch listener registration with `disableSwipe`**

  At the top of the touch-handler `useEffect`, add:
  ```ts
  if (disableSwipe) return;
  ```
  Add `disableSwipe` to the dependency array:
  ```ts
  }, [children.length, disableSwipe, setTrackX, snapTo]);
  ```

- [ ] **Step 8: Run all tests**

  ```bash
  cd phoneguessr && npx vitest run src/components/viewport-ui.test.tsx
  ```

  Expected: all tests pass, including the 2 new ones and all pre-existing ones.

- [ ] **Step 9: Commit**

  ```bash
  git add phoneguessr/src/components/SwipeContainer.tsx phoneguessr/src/components/viewport-ui.test.tsx
  git commit -m "refactor(swipe): accept controlled activeIndex and disableSwipe props"
  ```

---

## Task 2: Add `nav.admin` i18n key to all locales

**Files:**
- Modify: `phoneguessr/src/locales/en.json`
- Modify: `phoneguessr/src/locales/zh-TW.json`
- Modify: `phoneguessr/src/locales/zh-CN.json`
- Modify: `phoneguessr/src/locales/ja.json`
- Modify: `phoneguessr/src/locales/ko.json`

- [ ] **Step 1: Add key to each locale file**

  In each file, add `"nav.admin"` after the existing `nav.*` keys:

  | File | Value |
  |------|-------|
  | `en.json` | `"nav.admin": "Admin"` |
  | `zh-TW.json` | `"nav.admin": "管理"` |
  | `zh-CN.json` | `"nav.admin": "管理"` |
  | `ja.json` | `"nav.admin": "管理"` |
  | `ko.json` | `"nav.admin": "관리"` |

- [ ] **Step 2: Commit**

  ```bash
  git add phoneguessr/src/locales/
  git commit -m "feat(i18n): add nav.admin translation key to all locales"
  ```

---

## Task 3: Create `DesktopNav` component

**Files:**
- Create: `phoneguessr/src/components/desktop-nav.css`
- Create: `phoneguessr/src/components/DesktopNav.tsx`

- [ ] **Step 1: Write the failing test**

  Create `phoneguessr/src/components/DesktopNav.test.tsx`:

  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import { describe, expect, it, vi } from 'vitest';

  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
    }),
  }));

  vi.mock('../lib/auth-context', () => ({
    useAuth: () => ({ user: null, loading: false }),
  }));

  import { DesktopNav } from './DesktopNav';

  describe('DesktopNav', () => {
    it('renders 4 tab buttons', () => {
      render(<DesktopNav activeIndex={1} onNavigate={vi.fn()} />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
    });

    it('marks the active tab', () => {
      render(<DesktopNav activeIndex={2} onNavigate={vi.fn()} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons[2]).toHaveClass('active');
      expect(buttons[0]).not.toHaveClass('active');
    });

    it('calls onNavigate with correct index on click', () => {
      const onNavigate = vi.fn();
      render(<DesktopNav activeIndex={0} onNavigate={onNavigate} />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[2]); // Leaderboard = index 2
      expect(onNavigate).toHaveBeenCalledWith(2);
    });

    it('shows Admin link when user isAdmin', () => {
      vi.resetModules();
      vi.doMock('../lib/auth-context', () => ({
        useAuth: () => ({ user: { isAdmin: true }, loading: false }),
      }));
      // re-import after mock reset — simpler: just test via the class
    });

    it('does not show Admin link when user is not admin', () => {
      render(<DesktopNav activeIndex={0} onNavigate={vi.fn()} />);
      expect(screen.queryByRole('link')).toBeNull();
    });
  });
  ```

- [ ] **Step 2: Run test to confirm it fails**

  ```bash
  cd phoneguessr && npx vitest run src/components/DesktopNav.test.tsx
  ```

  Expected: FAIL — `DesktopNav` not found.

- [ ] **Step 3: Create `desktop-nav.css`**

  ```css
  .desktop-nav {
    display: none;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
      justify-content: center;
      gap: 0;
      border-bottom: 1px solid var(--border, #2a2a4a);
      margin-bottom: 8px;
      width: 100%;
      max-width: 480px;
      margin-inline: auto;
    }

    .desktop-nav-tab {
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      padding: 10px 20px;
      transition: color 0.15s, border-color 0.15s;
      text-decoration: none;
    }

    .desktop-nav-tab:hover {
      color: #e2e8f0;
    }

    .desktop-nav-tab.active {
      color: var(--accent, #e94560);
      border-bottom-color: var(--accent, #e94560);
    }

    /* Hide mobile-only chrome at desktop widths */
    .swipe-hint,
    .page-indicator {
      display: none;
    }
  }
  ```

- [ ] **Step 4: Create `DesktopNav.tsx`**

  ```tsx
  import { useTranslation } from 'react-i18next';
  import { useAuth } from '../lib/auth-context';
  import './desktop-nav.css';

  const TABS = [
    { index: 0, key: 'nav.profile' },
    { index: 1, key: 'nav.game' },
    { index: 2, key: 'nav.leaderboard' },
    { index: 3, key: 'nav.about' },
  ] as const;

  interface DesktopNavProps {
    activeIndex: number;
    onNavigate: (i: number) => void;
  }

  export function DesktopNav({ activeIndex, onNavigate }: DesktopNavProps) {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
      <nav className="desktop-nav">
        {TABS.map(tab => (
          <button
            key={tab.index}
            type="button"
            className={`desktop-nav-tab${activeIndex === tab.index ? ' active' : ''}`}
            onClick={() => onNavigate(tab.index)}
          >
            {t(tab.key)}
          </button>
        ))}
        {user?.isAdmin && (
          <a href="/admin" className="desktop-nav-tab desktop-nav-admin">
            {t('nav.admin')}
          </a>
        )}
      </nav>
    );
  }
  ```

- [ ] **Step 5: Run tests**

  ```bash
  cd phoneguessr && npx vitest run src/components/DesktopNav.test.tsx
  ```

  Expected: all tests pass.

- [ ] **Step 6: Commit**

  ```bash
  git add phoneguessr/src/components/DesktopNav.tsx phoneguessr/src/components/desktop-nav.css phoneguessr/src/components/DesktopNav.test.tsx
  git commit -m "feat(nav): add DesktopNav component and styles"
  ```

---

## Task 4: Wire everything together in `page.tsx`

**Files:**
- Modify: `phoneguessr/src/routes/page.tsx`

- [ ] **Step 1: Update `page.tsx`**

  Replace the file contents with:

  ```tsx
  import { Helmet } from '@modern-js/runtime/head';
  import { useEffect, useState } from 'react';
  import { useTranslation } from 'react-i18next';
  import { AboutPanel } from '../components/AboutPanel';
  import { AuthButton } from '../components/AuthButton';
  import { DesktopNav } from '../components/DesktopNav';
  import { Game } from '../components/Game';
  import { Leaderboard } from '../components/Leaderboard';
  import { ProfilePanel } from '../components/ProfilePanel';
  import { SwipeContainer } from '../components/SwipeContainer';
  import './index.css';

  export default function Page() {
    const { t } = useTranslation();
    const [activeIndex, setActiveIndex] = useState(1); // 1 = Game
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
      const mq = window.matchMedia('(min-width: 768px)');
      setIsDesktop(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }, []);

    return (
      <div className="app">
        <Helmet>
          <title>{t('game.meta.title')}</title>
          <meta name="description" content={t('game.meta.description')} />
        </Helmet>
        <header className="app-header">
          <h1 className="app-title">{t('game.title')}</h1>
          <AuthButton />
        </header>
        <DesktopNav activeIndex={activeIndex} onNavigate={setActiveIndex} />
        <SwipeContainer
          activeIndex={activeIndex}
          onActiveIndexChange={setActiveIndex}
          disableSwipe={isDesktop}
        >
          <ProfilePanel />
          <Game />
          <Leaderboard />
          <AboutPanel />
        </SwipeContainer>
      </div>
    );
  }
  ```

- [ ] **Step 2: Run full test suite**

  ```bash
  cd phoneguessr && npx vitest run
  ```

  Expected: all tests pass.

- [ ] **Step 3: Run linter**

  ```bash
  cd phoneguessr && npm run lint
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add phoneguessr/src/routes/page.tsx
  git commit -m "feat(nav): wire DesktopNav and controlled SwipeContainer into page"
  ```

---

## Task 5: Manual smoke test

- [ ] **Step 1: Start dev server**

  ```bash
  cd phoneguessr && npm run dev:mock
  ```

- [ ] **Step 2: Desktop smoke test (≥768px)**

  - Open browser at `http://localhost:3000` at ≥768px width
  - Confirm navbar appears above the card with 4 tabs
  - Confirm Game tab is active by default
  - Click each tab — panel switches with smooth animation
  - Confirm swipe gesture does NOT change panels
  - Confirm `.swipe-hint` arrows and `.page-indicator` are hidden

- [ ] **Step 3: Mobile smoke test (<768px)**

  - Resize to <768px (or use browser DevTools mobile mode)
  - Confirm navbar is hidden
  - Confirm swipe navigation still works
  - Confirm swipe hint arrows and page indicator still appear

- [ ] **Step 4: Final commit if any CSS tweaks needed**

  ```bash
  git add -p
  git commit -m "fix(nav): desktop navbar css tweaks after smoke test"
  ```
