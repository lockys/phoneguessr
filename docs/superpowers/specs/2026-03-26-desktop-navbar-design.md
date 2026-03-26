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
- Remove internal `activeIndex` state and `DEFAULT_INDEX` default — driven by prop
- Keep internal `activeIndexRef` (synced to prop) for use inside touch handlers
- When `disableSwipe` is true: skip registering `touchstart`/`touchmove`/`touchend` listeners (guard inside the `useEffect` that registers them)
- On prop `activeIndex` change: animate track to new position via `snapTo` (use a fixed speed of `1.0` for programmatic nav)
- `SwipeHints` and `PageIndicator` keep rendering — hidden at 768px+ via CSS class or their own media query

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

Admin tab (index `4` — reserved, rendered as a link to `/admin`) shown only when `user?.isAdmin === true`. Uses React Router or `<a href="/admin">` — not a panel switch.

```tsx
interface DesktopNavProps {
  activeIndex: number;
  onNavigate: (i: number) => void;
}
```

Renders a `<nav className="desktop-nav">` with `<button>` per tab. Active tab gets `className="desktop-nav-tab active"`.

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
  }

  .desktop-nav-tab:hover {
    color: #e2e8f0;
  }

  .desktop-nav-tab.active {
    color: var(--accent, #e94560);
    border-bottom-color: var(--accent, #e94560);
  }

  /* Hide mobile-only chrome at desktop widths */
  .swipe-hints,
  .page-indicator {
    display: none;
  }
}
```

---

## i18n

`nav.*` translation keys already exist in all locale files (`nav.profile`, `nav.game`, `nav.leaderboard`, `nav.about`). `DesktopNav` uses `useTranslation()` to render labels.

An `nav.admin` key may not exist — add `"admin": "Admin"` to all 5 locale files if absent.

---

## Modified Files Summary

| Action | File | Change |
|--------|------|--------|
| Modify | `phoneguessr/src/routes/page.tsx` | Lift `activeIndex` state, add `isDesktop` media query, render `DesktopNav` |
| Modify | `phoneguessr/src/components/SwipeContainer.tsx` | Accept `activeIndex`/`onActiveIndexChange`/`disableSwipe` props, remove internal state |
| Create | `phoneguessr/src/components/DesktopNav.tsx` | Desktop tab navbar component |
| Create | `phoneguessr/src/components/desktop-nav.css` | Navbar styles, hidden below 768px |

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| `window.matchMedia` unavailable (SSR) | `isDesktop` stays `false`; swipe enabled by default |
| `activeIndex` out of bounds | Clamped by SwipeContainer's existing `Math.max(0, Math.min(...))` logic |
| Admin tab on non-admin user | Not rendered — no error |
