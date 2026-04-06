# Telegram Mini App — Robust Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the user's Telegram account name immediately when the app opens in Telegram, and surface a retry option when server auth fails — instead of silently showing nothing.

**Architecture:** Read `window.Telegram.WebApp.initDataUnsafe.user` on mount to get an optimistic display name before the server auth completes. Expose `telegramDisplayName` and `telegramAuthError` from the auth context. Update `AuthButton` to show the name from `initDataUnsafe` while `user` is still null, and update `ProfilePanel` to show a "Connecting…" state and a retry button.

**Tech Stack:** React 19, Vitest, @testing-library/react, i18next (flat JSON locale files at `phoneguessr/src/locales/*.json`)

---

## File Map

| File | Change |
|------|--------|
| `phoneguessr/src/locales/en.json` | Add `profile.connectingTelegram` key |
| `phoneguessr/src/locales/ja.json` | Add `profile.connectingTelegram` key |
| `phoneguessr/src/locales/ko.json` | Add `profile.connectingTelegram` key |
| `phoneguessr/src/locales/zh-CN.json` | Add `profile.connectingTelegram` key |
| `phoneguessr/src/locales/zh-TW.json` | Add `profile.connectingTelegram` key |
| `phoneguessr/src/lib/auth-context.tsx` | Add `telegramDisplayName`, `telegramAuthError` to context; populate from `initDataUnsafe` |
| `phoneguessr/src/components/AuthButton.tsx` | Show `telegramDisplayName` + avatar when `isTelegram && !user` |
| `phoneguessr/src/components/AuthButton.test.tsx` | Add Telegram display tests |
| `phoneguessr/src/components/ProfilePanel.tsx` | Show "Connecting…" and Retry states |
| `phoneguessr/src/components/ProfilePanel.test.tsx` | Add Telegram connecting/retry tests |

---

### Task 1: Add i18n key for Telegram connecting state

**Files:**
- Modify: `phoneguessr/src/locales/en.json`
- Modify: `phoneguessr/src/locales/ja.json`
- Modify: `phoneguessr/src/locales/ko.json`
- Modify: `phoneguessr/src/locales/zh-CN.json`
- Modify: `phoneguessr/src/locales/zh-TW.json`

All locale files are flat JSON — each key is a dot-separated string at the top level, not nested.

- [ ] **Step 1: Add `profile.connectingTelegram` to `en.json`**

In `phoneguessr/src/locales/en.json`, after the `"profile.signInPrompt"` line, add:
```json
  "profile.connectingTelegram": "Connecting Telegram account…",
```

- [ ] **Step 2: Add `profile.connectingTelegram` to `ja.json`**

In `phoneguessr/src/locales/ja.json`, after the `"profile.signInPrompt"` line, add:
```json
  "profile.connectingTelegram": "Telegramアカウントに接続中…",
```

- [ ] **Step 3: Add `profile.connectingTelegram` to `ko.json`**

In `phoneguessr/src/locales/ko.json`, after the `"profile.signInPrompt"` line, add:
```json
  "profile.connectingTelegram": "Telegram 계정 연결 중…",
```

- [ ] **Step 4: Add `profile.connectingTelegram` to `zh-CN.json`**

In `phoneguessr/src/locales/zh-CN.json`, after the `"profile.signInPrompt"` line, add:
```json
  "profile.connectingTelegram": "正在连接 Telegram 账户…",
```

- [ ] **Step 5: Add `profile.connectingTelegram` to `zh-TW.json`**

In `phoneguessr/src/locales/zh-TW.json`, after the `"profile.signInPrompt"` line, add:
```json
  "profile.connectingTelegram": "正在連接 Telegram 帳戶…",
```

- [ ] **Step 6: Commit**

```bash
cd /home/node/phoneguessr
git add phoneguessr/src/locales/
git commit -m "i18n: add profile.connectingTelegram key for all locales"
```

---

### Task 2: Extend auth context with telegramDisplayName and telegramAuthError

**Files:**
- Modify: `phoneguessr/src/lib/auth-context.tsx`

No test file for auth-context directly — it's a React context. The new fields are tested through component tests in Tasks 3 and 4. This task just wires up the data.

- [ ] **Step 1: Update the `AuthContextValue` interface**

In `phoneguessr/src/lib/auth-context.tsx`, replace the `AuthContextValue` interface:

```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isTelegram: boolean;
  telegramDisplayName: string | null;
  telegramAuthError: boolean;
  webAuthnSupported: boolean;
  login: () => void;
  logout: () => void;
  loginWithPasskey: () => Promise<void>;
  loginWithTelegram: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
```

- [ ] **Step 2: Update the `createContext` default value**

Replace the `createContext` call:

```typescript
const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isTelegram: false,
  telegramDisplayName: null,
  telegramAuthError: false,
  webAuthnSupported: false,
  login: () => {},
  logout: () => {},
  loginWithPasskey: async () => {},
  loginWithTelegram: async () => {},
  refreshUser: async () => {},
});
```

- [ ] **Step 3: Add state variables in `AuthProvider`**

In the `AuthProvider` function body, after the existing `useState` calls, add:

```typescript
const [telegramAuthError, setTelegramAuthError] = useState(false);
```

And add a derived value (not state — read synchronously from `initDataUnsafe`):

```typescript
const telegramDisplayName: string | null = isTelegramEnv
  ? (() => {
      const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (!u) return null;
      return [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
    })()
  : null;
```

Place this inside `AuthProvider` before the `return`.

- [ ] **Step 4: Update the `useEffect` to set `telegramAuthError` on failure**

Replace the existing `useEffect` in `AuthProvider`:

```typescript
useEffect(() => {
  fetch('/api/auth/me')
    .then(res => res.json())
    .then(async data => {
      if (data.user) {
        setUser(data.user);
        setLoading(false);
      } else if (isTelegramEnv) {
        try {
          await loginWithTelegram();
        } catch {
          setTelegramAuthError(true);
        }
        setLoading(false);
      } else {
        setLoading(false);
      }
    })
    .catch(() => setLoading(false));
}, [loginWithTelegram]);
```

- [ ] **Step 5: Pass the new values through the context provider**

Replace the `<AuthContext.Provider value={{...}}>` props:

```typescript
<AuthContext.Provider
  value={{
    user,
    loading,
    isTelegram: isTelegramEnv,
    telegramDisplayName,
    telegramAuthError,
    webAuthnSupported,
    login,
    logout,
    loginWithPasskey,
    loginWithTelegram,
    refreshUser,
  }}
>
```

- [ ] **Step 6: Run lint to check for type errors**

```bash
cd /home/node/phoneguessr/phoneguessr
npm run lint 2>&1 | head -30
```

Expected: no errors related to the changed file.

- [ ] **Step 7: Commit**

```bash
cd /home/node/phoneguessr
git add phoneguessr/src/lib/auth-context.tsx
git commit -m "feat: expose telegramDisplayName and telegramAuthError from auth context"
```

---

### Task 3: Show optimistic Telegram name in AuthButton

**Files:**
- Modify: `phoneguessr/src/components/AuthButton.tsx`
- Modify: `phoneguessr/src/components/AuthButton.test.tsx`

- [ ] **Step 1: Write the failing test — Telegram display name shown when user is null**

In `phoneguessr/src/components/AuthButton.test.tsx`, update the mock object type and add a new describe block.

First, update the `mockAuth` definition at the top of the file (after the `vi.mock` calls):

```typescript
let mockAuth = {
  user: null as { id: number; displayName: string; avatarUrl?: string } | null,
  loading: false,
  isTelegram: false,
  telegramDisplayName: null as string | null,
  telegramAuthError: false,
  login: mockLogin,
  logout: mockLogout,
};
```

Then update the `beforeEach` reset block to include the new fields:

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  mockAuth = {
    user: null,
    loading: false,
    isTelegram: false,
    telegramDisplayName: null,
    telegramAuthError: false,
    login: mockLogin,
    logout: mockLogout,
  };
  mockLogin.mockClear();
  mockLogout.mockClear();
  window.history.replaceState({}, '', '/');
});
```

Then add a new describe block at the end of the outer `describe('AuthButton', ...)` block:

```typescript
describe('Telegram environment', () => {
  it('shows Telegram display name when user is null but telegramDisplayName is set', () => {
    mockAuth.isTelegram = true;
    mockAuth.telegramDisplayName = 'Anna Kowalski';
    render(<AuthButton />);
    expect(screen.getByText('Anna Kowalski')).toBeInTheDocument();
  });

  it('shows nothing when isTelegram and both user and telegramDisplayName are null', () => {
    mockAuth.isTelegram = true;
    const { container } = render(<AuthButton />);
    expect(container.innerHTML).toBe('');
  });

  it('does not show sign-out button when in Telegram', () => {
    mockAuth.isTelegram = true;
    mockAuth.telegramDisplayName = 'Anna Kowalski';
    render(<AuthButton />);
    expect(screen.queryByRole('button', { name: 'Sign out' })).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd /home/node/phoneguessr/phoneguessr
npx vitest run src/components/AuthButton.test.tsx 2>&1 | tail -20
```

Expected: tests in the "Telegram environment" block FAIL because `AuthButton` doesn't handle `telegramDisplayName` yet.

- [ ] **Step 3: Update AuthButton to use telegramDisplayName**

Replace the entire content of `phoneguessr/src/components/AuthButton.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';

export function AuthButton() {
  const { t } = useTranslation();
  const { user, loading, isTelegram, telegramDisplayName, login, logout } =
    useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setAuthError(error);
      window.history.replaceState({}, '', window.location.pathname);
      const timer = setTimeout(() => setAuthError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (loading) {
    return null;
  }

  // Authenticated user (any provider)
  if (user) {
    return (
      <div className="auth-user">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt=""
            className="auth-avatar"
            referrerPolicy="no-referrer"
          />
        )}
        <span className="auth-name">{user.displayName}</span>
        {!isTelegram && (
          <button type="button" className="auth-btn" onClick={logout}>
            {t('auth.signOut')}
          </button>
        )}
      </div>
    );
  }

  // In Telegram: show optimistic name from initDataUnsafe while server auth runs
  if (isTelegram) {
    if (!telegramDisplayName) return null;
    return (
      <div className="auth-user">
        <span className="auth-name">{telegramDisplayName}</span>
      </div>
    );
  }

  // Web: show sign-in button
  return (
    <>
      {authError && <span className="auth-error">{t('auth.error')}</span>}
      <button type="button" className="auth-btn auth-btn-login" onClick={login}>
        {t('auth.signIn')}
      </button>
    </>
  );
}
```

- [ ] **Step 4: Run the tests to confirm they pass**

```bash
cd /home/node/phoneguessr/phoneguessr
npx vitest run src/components/AuthButton.test.tsx 2>&1 | tail -20
```

Expected: ALL tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /home/node/phoneguessr
git add phoneguessr/src/components/AuthButton.tsx phoneguessr/src/components/AuthButton.test.tsx
git commit -m "feat: show optimistic Telegram display name in AuthButton header"
```

---

### Task 4: Show connecting/retry states in ProfilePanel

**Files:**
- Modify: `phoneguessr/src/components/ProfilePanel.tsx`
- Modify: `phoneguessr/src/components/ProfilePanel.test.tsx`

- [ ] **Step 1: Write the failing tests**

In `phoneguessr/src/components/ProfilePanel.test.tsx`, the `vi.mock('../lib/auth-context', ...)` currently uses a single static return value. We need to make it dynamic so tests can override it.

Replace the static mock with a dynamic one. Find this block:

```typescript
// Mock auth context (unauthenticated user)
vi.mock('../lib/auth-context', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));
```

Replace it with:

```typescript
let mockAuthState = {
  user: null as { id: number; displayName: string; avatarUrl?: string; email?: string | null; isAdmin?: boolean; region?: string | null } | null,
  loading: false,
  isTelegram: false,
  telegramDisplayName: null as string | null,
  telegramAuthError: false,
  login: vi.fn(),
  logout: vi.fn(),
  loginWithTelegram: vi.fn(),
  refreshUser: vi.fn(),
};

vi.mock('../lib/auth-context', () => ({
  useAuth: () => mockAuthState,
}));
```

Then add a `beforeEach` inside the outer `describe('ProfilePanel', ...)` that resets the state before each test (add it right after `beforeEach(() => { localStorage.clear(); })`):

```typescript
beforeEach(() => {
  mockAuthState = {
    user: null,
    loading: false,
    isTelegram: false,
    telegramDisplayName: null,
    telegramAuthError: false,
    login: vi.fn(),
    logout: vi.fn(),
    loginWithTelegram: vi.fn(),
    refreshUser: vi.fn(),
  };
});
```

Also update the translation mock to include the new key. Find `vi.mock('react-i18next', ...)` and add to the `translations` object:

```typescript
'profile.connectingTelegram': 'Connecting Telegram account…',
'auth.retry': 'Retry sign in',
```

Now add a new describe block at the end of the outer `describe('ProfilePanel', ...)` block:

```typescript
describe('Telegram environment', () => {
  it('shows connecting message while loading in Telegram', () => {
    mockAuthState.isTelegram = true;
    mockAuthState.loading = true;
    render(<ProfilePanel />);
    expect(screen.getByText('Connecting Telegram account…')).toBeInTheDocument();
  });

  it('shows retry button when Telegram auth failed', () => {
    mockAuthState.isTelegram = true;
    mockAuthState.loading = false;
    mockAuthState.telegramAuthError = true;
    render(<ProfilePanel />);
    expect(screen.getByRole('button', { name: 'Retry sign in' })).toBeInTheDocument();
  });

  it('calls loginWithTelegram when retry button clicked', () => {
    mockAuthState.isTelegram = true;
    mockAuthState.loading = false;
    mockAuthState.telegramAuthError = true;
    render(<ProfilePanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry sign in' }));
    expect(mockAuthState.loginWithTelegram).toHaveBeenCalledOnce();
  });

  it('does not show standard sign-in prompt in Telegram', () => {
    mockAuthState.isTelegram = true;
    mockAuthState.loading = false;
    render(<ProfilePanel />);
    expect(screen.queryByText('Sign in to sync')).toBeNull();
  });
});
```

Also add `fireEvent` to the imports at the top of the test file (it's used in the new test):

```typescript
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
```

- [ ] **Step 2: Run the tests to confirm they fail**

```bash
cd /home/node/phoneguessr/phoneguessr
npx vitest run src/components/ProfilePanel.test.tsx 2>&1 | tail -30
```

Expected: the 4 new "Telegram environment" tests FAIL. The existing tests may also fail because the mock shape changed — that's expected; we'll fix them in the next step.

- [ ] **Step 3: Update ProfilePanel to use the new context values**

In `phoneguessr/src/components/ProfilePanel.tsx`, update the destructuring line at the top of `ProfilePanel`:

```typescript
const { user, login, loginWithTelegram, isTelegram, telegramAuthError, refreshUser } = useAuth();
```

Then find the `{!user && (` block at the bottom of the JSX (the sign-in prompt section). It currently looks like:

```typescript
{!user && (
  <div className="profile-auth-prompt">
    <p>{t('profile.signInPrompt')}</p>
    {isTelegram ? (
      <button
        type="button"
        className="auth-btn auth-btn-login"
        onClick={loginWithTelegram}
      >
        {t('auth.retry')}
      </button>
    ) : (
      <button
        type="button"
        className="auth-btn auth-btn-login"
        onClick={login}
      >
        {t('auth.signIn')}
      </button>
    )}
  </div>
)}
```

Replace it with:

```typescript
{!user && (
  <div className="profile-auth-prompt">
    {isTelegram ? (
      <>
        {telegramAuthError ? (
          <>
            <p>{t('profile.signInPrompt')}</p>
            <button
              type="button"
              className="auth-btn auth-btn-login"
              onClick={loginWithTelegram}
            >
              {t('auth.retry')}
            </button>
          </>
        ) : (
          <p>{t('profile.connectingTelegram')}</p>
        )}
      </>
    ) : (
      <>
        <p>{t('profile.signInPrompt')}</p>
        <button
          type="button"
          className="auth-btn auth-btn-login"
          onClick={login}
        >
          {t('auth.signIn')}
        </button>
      </>
    )}
  </div>
)}
```

- [ ] **Step 4: Run the tests to confirm all pass**

```bash
cd /home/node/phoneguessr/phoneguessr
npx vitest run src/components/ProfilePanel.test.tsx 2>&1 | tail -30
```

Expected: ALL tests PASS.

- [ ] **Step 5: Run the full test suite to check for regressions**

```bash
cd /home/node/phoneguessr/phoneguessr
npm run test 2>&1 | tail -30
```

Expected: All tests pass. If any fail, fix them before committing.

- [ ] **Step 6: Run lint**

```bash
cd /home/node/phoneguessr/phoneguessr
npm run lint 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
cd /home/node/phoneguessr
git add phoneguessr/src/components/ProfilePanel.tsx phoneguessr/src/components/ProfilePanel.test.tsx
git commit -m "feat: show Telegram connecting state and retry button in ProfilePanel"
```

---

## Self-Review

**Spec coverage:**
- ✅ Show name from `initDataUnsafe` immediately → Task 2 (auth-context) + Task 3 (AuthButton)
- ✅ Continue server auth in background → Task 2 (`useEffect` unchanged, just adds error state)
- ✅ Keep showing name if server auth fails → Task 3 (`telegramDisplayName` stays visible)
- ✅ Show "Connecting…" in ProfilePanel while auth runs → Task 4
- ✅ Show Retry button on failure → Task 4
- ✅ i18n for new string → Task 1

**Placeholder scan:** No TBDs, TODOs, or vague steps.

**Type consistency:**
- `telegramDisplayName: string | null` — used consistently in auth-context, AuthButton, AuthButton.test, ProfilePanel (read-only, not passed through ProfilePanel so no type needed there)
- `telegramAuthError: boolean` — used consistently in auth-context, ProfilePanel, ProfilePanel.test
- `loginWithTelegram` — already existed; no signature change
