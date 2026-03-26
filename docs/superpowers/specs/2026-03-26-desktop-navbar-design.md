# Desktop Navbar — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

Add a horizontal top navbar that appears on screens ≥ 768px wide, allowing desktop users to navigate between the four panels (Game, Profile, Leaderboard, About) by clicking tabs. Below 768px the existing swipe/touch navigation remains unchanged. The 480px centered card layout is preserved — the navbar sits above it.

---

## Scope

**In scope:**
- `DesktopNav` component: top navbar with 4 tabs + conditional Admin tab
- `desktop-nav.css`: navbar styles, hidden below 768px
- Lift `activeIndex` state from `SwipeContainer` to `page.tsx`
- Add `activeIndex`, `onActiveIndexChange`, `disableSwipe` props to `SwipeContainer`
- `useMediaQuery` hook in `page.tsx` to drive `disableSwipe`
- Hide `SwipeHints` and `PageIndicator` at 768px+ via CSS
- Add `nav.admin` key to all 5 locale files

**Out of scope:**
- Routing changes (stays single `/` route)
- Mobile navigation changes
- Animation on desktop panel switch (snap is sufficient)
- URL hash per panel

---

## State Lift

`page.tsx` gains:

```tsx
const [activeIndex, setActiveIndex] = useState(1); // 1 = Game
const [isDesktop, setIsDesktop] = useState(false);

useEffect(() => {
  const mq = window.matchMedia('(min-width: 768px)');
  setIsDesktop(mq.matches);
  const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}, []);
```

Both `activeIndex`/`setActiveIndex` and `isDesktop` are passed to child components:

```tsx
<DesktopNav activeIndex={activeIndex} onNavigate={setActiveIndex} />
<SwipeContainer
  activeIndex={activeIndex}
  onActiveIndexChange={setActiveIndex}
  disableSwipe={isDesktop}
>
```

---

## SwipeContainer Props

Add to `SwipeContainerProps`:

```ts
interface SwipeContainerProps {
  children: ReactNode[];
  activeIndex: number;
  onActiveIndexChange: (i: number) => void;
  disableSwipe?: boolean;
}
```

**Changes:**
- Remove internal `activeIndex` / `setActiveIndex` state and `DEFAULT_INDEX` constant — driven by prop
- Keep internal `activeIndexRef` (synced to prop value) for use inside touch handlers
- **Initial placement `useEffect`**: Replace `DEFAULT_INDEX` with the `activeIndex` prop. Use a `useEffect([])` that reads `activeIndex` from a ref so it fires exactly once on mount using the correct starting index:
  ```ts
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex; // keep in sync on every render
  // ...
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setTrackX(-activeIndexRef.current * container.clientWidth);
  }, [setTrackX]); // fires once on mount
  ```
- **Prop-driven navigation**: Add a separate `useEffect([activeIndex])` that animates the track when the prop changes programmatically (e.g. from DesktopNav click). Compute `fromPx` from the current rendered position before calling `snapTo`:
  ```ts
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;
    const width = container.clientWidth;
    // Read current transform to get fromPx
    const currentX = -(activeIndexRef.current) * width;
    snapTo(currentX, activeIndex, 1.0);
    activeIndexRef.current = activeIndex;
  }, [activeIndex, snapTo]);
  ```
  Note: this effect must not run on the initial mount render (it would conflict with the initial placement effect). Guard with a `hasMountedRef`:
  ```ts
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    // ... snapTo logic above
  }, [activeIndex, snapTo]);
  ```
- **`disableSwipe` guard**: Inside the `useEffect` that registers `touchstart`/`touchmove`/`touchend`, return early if `disableSwipe` is true:
  ```ts
  useEffect(() => {
    if (disableSwipe) return;
    const el = containerRef.current;
    // ... register listeners
  }, [children.length, disableSwipe, setTrackX, snapTo]);
  ```
- **Existing tests**: `SwipeContainer` in existing tests passes no `activeIndex`/`onActiveIndexChange` props. Make these props optional with safe defaults so existing tests continue to pass without modification:
  ```ts
  interface SwipeContainerProps {
    children: ReactNode[];
    activeIndex?: number;           // default: 1 (Game)
    onActiveIndexChange?: (i: number) => void;  // default: noop
    disableSwipe?: boolean;         // default: false
  }
  ```
  Internal logic uses `activeIndex ?? 1` and `onActiveIndexChange ?? (() => {})`.
- `SwipeHints` and `PageIndicator` keep rendering — hidden at 768px+ via CSS

---

## DesktopNav Component

**File:** `phoneguessr/src/components/DesktopNav.tsx`
**CSS:** `phoneguessr/src/components/desktop-nav.css`

Panel order and indices (matching `PANEL_KEYS` in SwipeContainer):
| Index | Label key | Label (en) |
|-------|-----------|------------|
| 0 | `nav.profile` | Profile |
| 1 | `nav.game` | Game |
| 2 | `nav.leaderboard` | Leaderboard |
| 3 | `nav.about` | About |

Admin tab rendered as `<a href="/admin">` (not a panel switch) and shown only when `user?.isAdmin === true`. `DesktopNav` calls `useAuth()` directly (same pattern as `AuthButton`) — no `user` prop.

```tsx
interface DesktopNavProps {
  activeIndex: number;
  onNavigate: (i: number) => void;
}
```

Renders a `<nav className="desktop-nav">` with `<button>` per tab. Active tab gets `className="desktop-nav-tab active"`. Admin link gets `className="desktop-nav-tab desktop-nav-admin"` (never active state).

---

## CSS

`desktop-nav.css`:

```css
.desktop-nav {
  display: none; /* hidden on mobile */
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

---

## i18n

`nav.*` translation keys already exist in all locale files. `DesktopNav` uses `useTranslation()` to render labels. Add `"admin": "Admin"` (and translations) unconditionally to the `nav` section of all 5 locale files:

| Locale | Key | Value |
|--------|-----|-------|
| `en.json` | `nav.admin` | `"Admin"` |
| `zh-TW.json` | `nav.admin` | `"管理"` |
| `zh-CN.json` | `nav.admin` | `"管理"` |
| `ja.json` | `nav.admin` | `"管理"` |
| `ko.json` | `nav.admin` | `"관리"` |

---

## Modified Files Summary

| Action | File | Change |
|--------|------|--------|
| Modify | `phoneguessr/src/routes/page.tsx` | Lift `activeIndex` state, add `isDesktop` media query, render `DesktopNav` |
| Modify | `phoneguessr/src/components/SwipeContainer.tsx` | Accept `activeIndex`/`onActiveIndexChange`/`disableSwipe` props, remove internal state, make optional with defaults |
| Modify | `phoneguessr/src/locales/en.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/zh-TW.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/zh-CN.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/ja.json` | Add `nav.admin` |
| Modify | `phoneguessr/src/locales/ko.json` | Add `nav.admin` |
| Create | `phoneguessr/src/components/DesktopNav.tsx` | Desktop tab navbar component |
| Create | `phoneguessr/src/components/desktop-nav.css` | Navbar styles, hidden below 768px |

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| `window.matchMedia` unavailable (SSR) | `isDesktop` stays `false`; swipe enabled by default |
| `activeIndex` out of bounds | Clamped by SwipeContainer's existing `Math.max(0, Math.min(...))` logic |
| Admin tab on non-admin user | Not rendered — no error |
