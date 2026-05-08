# PhoneGuessr — Google Login Fix + Passkey Removal Plan

> **For Hermes / Codex:** 依已批准 spec 實作，維持 Karpathy 式手術式修改。只碰 auth 相關 surface，不順手重構其他模組。

**Goal:** 修好 Google OAuth callback URI 決策，並把 passkey 登入先從產品與前後端公開 surface 移除。

**Architecture:** Google OAuth 改回設定值優先、request-derived fallback 次之，login/callback 共用同一套 redirect URI helper。Passkey 這輪不做資料清理，只把 UI、context、rewrites、mock、測試與 `/me` 回應中的 passkey surface 收掉。

**Tech Stack:** Vercel serverless `api/*.ts`, React 19, Modern.js, Vitest, mock middleware

---

## Task order

### Task 1: 收斂 Google redirect URI 邏輯到單一 helper
- 檔案
  - `api/auth.ts`
  - `phoneguessr/src/lib/auth.ts`
- 修改
  - 在 auth lib 或 `api/auth.ts` 內新增單一 helper，規則為：
    - `GOOGLE_REDIRECT_URI` 有值且非空 → 直接使用
    - 否則 fallback `proto://host/api/auth/callback`
  - `handleLogin()` 與 `handleCallback()` 都共用同一個 helper
  - 移除現在「import 了 `GOOGLE_REDIRECT_URI` 但流程不使用」的矛盾狀態
- 驗證
  - helper 行為能同時涵蓋 production env 與 local fallback
  - 不影響 logout / Telegram auth

### Task 2: 補 Google login handler 測試，鎖住 root cause
- 檔案
  - `phoneguessr/tests/auth-login-handler.test.ts`
  - 視需要新增 callback handler test
- 修改
  - 把現在失敗的 redirect URI 測試改成符合新規格
  - 至少覆蓋兩個情境：
    1. env 有 `GOOGLE_REDIRECT_URI` → 必須使用 env 值
    2. env 沒設定 → 才 fallback request host
- 驗證
  - 原本失敗的 login handler test 轉綠
  - 不要只測 302，要測實際 `redirect_uri`

### Task 3: 移除 AuthButton 的 passkey 登入 UI
- 檔案
  - `phoneguessr/src/components/AuthButton.tsx`
  - `phoneguessr/src/components/AuthButton.test.tsx`
- 修改
  - 拿掉：
    - `webAuthnSupported`
    - `loginWithPasskey`
    - passkey loading/error state
    - passkey button / error message rendering
  - 保留 Google sign-in、sign-out、Telegram optimistic name flow
- 驗證
  - 未登入 web 狀態只剩 Google sign-in
  - 已登入 / Telegram 顯示不退化
  - `AuthButton.test.tsx` 改成明確驗證「只有 Google 登入入口」

### Task 4: 簡化 auth context，移除 passkey public API
- 檔案
  - `phoneguessr/src/lib/auth-context.tsx`
  - `phoneguessr/src/lib/auth-context.test.tsx`
- 修改
  - 從 `AuthContextValue` 移除：
    - `webAuthnSupported`
    - `hasPasskey`
    - `loginWithPasskey`
    - `registerPasskey`
  - 刪除 `@simplewebauthn/browser` import 與相關邏輯
  - `refreshUser()` / 初始化載入不再依賴 `hasPasskey`
- 驗證
  - auth context tests 改成只驗證目前還存在的 auth surface
  - 不留死掉的 mock / type / fetch expectations

### Task 5: 簡化 `/api/auth/me` 回應，移除 passkey 暴露
- 檔案
  - `api/auth.ts`
  - `phoneguessr/tests/auth-me-handler.test.ts`
- 修改
  - `/api/auth/me` 改為只回傳 `user`
  - 拿掉 `passkeyCredentials` 查詢與 `hasPasskey` 回應欄位
- 驗證
  - `auth-me` 測試同步更新
  - 既有 Google / Telegram session 解析仍正常

### Task 6: 停用 passkey 路由對外暴露與 mock 支援
- 檔案
  - `vercel.json`
  - `phoneguessr/tests/vercel-config.test.ts`
  - `phoneguessr/src/mock/middleware.ts`
  - `phoneguessr/src/mock/middleware.test.ts`
- 修改
  - 移除 `/api/auth/passkey/:action` rewrite
  - 移除 mock middleware 中 4 個 passkey 路由
  - 測試同步刪除 / 改寫
- 驗證
  - rewrite 測試只保留現存 auth routes
  - mock middleware 測試不再期待 passkey endpoints

### Task 7: 保留資料層，但不再作為本輪公開功能
- 檔案
  - 不主動改 schema / migration
- 修改
  - 不刪 `passkey_credentials` table
  - 不刪 challenge-store 檔案，除非 build 中出現 import orphan 必須一起清
- 驗證
  - 這輪不產生 migration
  - 每一個被改掉的 import 都要確認沒有留下 type/runtime orphan

### Task 8: 測試與 review
- 先跑精準測試
```bash
cd /opt/data/home/projects/phoneguessr/phoneguessr
npm test -- tests/auth-login-handler.test.ts
npm test -- tests/auth-me-handler.test.ts
npm test -- src/components/AuthButton.test.tsx
npm test -- src/lib/auth-context.test.tsx
npm test -- tests/vercel-config.test.ts
npm test -- src/mock/middleware.test.ts
```
- 再跑 auth / routing 相關回歸（若時間允許可擴大）
```bash
cd /opt/data/home/projects/phoneguessr/phoneguessr
npm test -- tests/api-endpoints.test.ts tests/frontend-game-flow.test.ts
npm run build
```
- review
```bash
cd /opt/data/home/projects/phoneguessr
git diff --stat
git diff --check
```

## Build constraints
- 不碰 leaderboard、gameplay、profile 其他非 auth 區塊
- 不做 passkey 資料庫 migration
- 不順手改 Telegram auth flow
- 不重新設計 auth provider 架構
- 若發現 Google 問題其實還包含 env 缺值，要把缺的 env 名稱明確報出來，不要瞎補 workaround

## Verification checklist
- `tests/auth-login-handler.test.ts` 綠燈
- `redirect_uri` 規則符合 spec
- 前端不再出現 passkey 登入按鈕或文案
- `useAuth()` 不再暴露 passkey API
- `/api/auth/me` 不再回 `hasPasskey`
- `vercel.json` 不再 rewrite passkey route
- mock / tests 不再依賴 passkey flow
- `npm run build` 可過

## Notes
- 目前我已確認 `phoneguessr/tests/auth-login-handler.test.ts` 在現況下會 fail，這個就是 build 前的既有紅燈基準。
- 這輪 ship 之前，最好再用實站或 dev server 點一次 Google sign-in，確認 callback 沒再導去錯 host。