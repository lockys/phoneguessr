# PhoneGuessr — Google Login Fix + Passkey Removal Design

**Date:** 2026-05-08  
**Status:** Review needed

## Problem

卡爾文這次要處理兩件事：

1. Google 登入壞掉
2. 先把 passkey 登入移除

我先盤過目前實作，看到兩個很明確的點：

### 1) Google OAuth 最近被改成「每次用 request host 動態組 redirect_uri」

目前 `api/auth.ts` 的 `handleLogin()` / `handleCallback()` 都不再使用 `GOOGLE_REDIRECT_URI`，而是直接用：

- `x-forwarded-proto`
- `host`
- `${proto}://${host}/api/auth/callback`

這個改法有風險，因為 Google OAuth 的 redirect URI 必須和 Google Console 設定值精準一致。只要實際進站 host 跟你註冊的 callback 網域不完全一樣，就會壞掉。

我有抓到直接證據：

- `api/auth.ts` 仍然 import `GOOGLE_REDIRECT_URI`，但已經沒在登入流程使用
- `phoneguessr/tests/auth-login-handler.test.ts` 目前失敗
- 失敗內容是：
  - 預期 `http://localhost:3000/api/auth/callback`
  - 實際變成 `http://localhost/api/auth/callback`

這代表最近這個「動態 redirect URI」改動，已經跟原本預期行為不一致。

### 2) passkey 目前不只在 UI，連 auth context / API / rewrites / mock 都有整條支線

目前 passkey 相關面向包含：

- UI：`phoneguessr/src/components/AuthButton.tsx`
- client auth flow：`phoneguessr/src/lib/auth-context.tsx`
- server API：`api/auth/passkey.ts`
- rewrites：`vercel.json`
- mock：`phoneguessr/src/mock/middleware.ts`
- tests：`AuthButton.test.tsx`, `auth-context.test.tsx`, `vercel-config.test.ts`, `mock/middleware.test.ts`
- DB / schema：`passkeyCredentials`, challenge store

所以「移除 passkey 登入」如果要做乾淨，至少要先定義這次是：

- 只移除前台登入入口
- 還是連 API / rewrites / tests 一起停用

## Root cause hypothesis

### Google login

最有可能的 root cause 是：

- OAuth flow 改成依 request host 動態組 callback
- 但部署實際入口、alias domain、preview domain、local dev domain 不一定都在 Google Console 註冊
- 結果 Google 拒絕或 token exchange mismatch

### Passkey

passkey 本身不是這次要修的功能，而是產品決策改回單一 Google 登入；因此這次不做 WebAuthn bug fix，直接把 passkey login surface 拿掉。

## Approach

### A. Google login 回到「明確、可控」的 redirect URI 策略

這次建議把 Google OAuth 改回以 **設定值優先** 為主，而不是無條件信任 request host。

具體方向：

1. `GOOGLE_REDIRECT_URI` 有值時，`handleLogin()` 與 `handleCallback()` 都統一使用它
2. 只有在本機開發或 env 未設定時，才 fallback 成 request-derived callback
3. 補測試，明確鎖住：
   - env 有設定時必須用設定值
   - env 沒設定時才走 request-derived fallback

這樣可以避免 production alias / preview / host header 漂移把 Google OAuth 弄壞。

### B. passkey 這輪先做「完整停用登入能力」，不做資料庫清除

這輪先採最小且可逆的做法：

- 移除前台 passkey 登入按鈕
- 拿掉 client auth context 裡的 passkey login / register 能力暴露
- 停用 passkey API rewrites 與 mock routes
- 刪掉只為 passkey 存在的前端／路由測試
- **不動** `passkey_credentials` table 與既有資料
- **不動** challenge store / server code 以外的資料清除腳本

原因很單純：

- 使用者現在只要求「先移除 passkey 登入」
- 不需要為了產品開關去做 schema migration 或刪資料
- 之後若要恢復 passkey，成本比較低

## Architecture

### Google OAuth

受影響檔案：

- `api/auth.ts`
- `phoneguessr/src/lib/auth.ts`
- `phoneguessr/tests/auth-login-handler.test.ts`
- 可能補新的 callback handler test

預期邏輯：

- 新增單一 helper 決定 Google callback URL
- login redirect 與 callback token exchange 共用同一個 helper
- helper 規則：
  - `GOOGLE_REDIRECT_URI` 非空 → 直接用它
  - 否則 → fallback request-derived URL

### Passkey removal

受影響檔案：

- `phoneguessr/src/components/AuthButton.tsx`
- `phoneguessr/src/components/AuthButton.test.tsx`
- `phoneguessr/src/lib/auth-context.tsx`
- `phoneguessr/src/lib/auth-context.test.tsx`
- `vercel.json`
- `phoneguessr/tests/vercel-config.test.ts`
- `phoneguessr/src/mock/middleware.ts`
- `phoneguessr/src/mock/middleware.test.ts`
- `api/auth.ts`（若 `/me` 不再需要 `hasPasskey`）

預期邏輯：

- UI 只保留 Google sign-in
- `useAuth()` 不再暴露 `webAuthnSupported`, `hasPasskey`, `loginWithPasskey`, `registerPasskey`
- `/api/auth/me` 回應簡化，不再帶 `hasPasskey`
- `vercel.json` 不再對外公開 `/api/auth/passkey/*` rewrite
- mock 與測試同步移除 passkey 相關分支

## Scope

這輪會做：

- 修正 Google OAuth redirect URI 決策
- 移除 passkey 登入入口與 client/server surface
- 更新測試讓 auth 行為重新被鎖住

這輪先不做：

- 刪除 `passkey_credentials` 資料表
- 刪除既有 passkey credential 資料
- 重做 Google auth provider 結構
- 新增其他登入方式
- 順手重構整個 auth 模組

## Validation checklist

- Google login redirect 重新使用正確 callback URI
- auth login handler 測試通過
- 前端登入區只剩 Google sign-in
- 程式碼內不再有 passkey UI / auth-context public API 暴露
- Vercel rewrite 不再暴露 `/api/auth/passkey/*`
- mock / tests 不再依賴 passkey 路由
- 既有 Google / Telegram auth 不被一起打壞

## Open question / default decision

這份 spec 先採的預設是：

- **passkey 先做產品層停用，不做資料庫 migration**

如果你要更狠一點，下一版也可以把 server handler 跟 schema 一起清掉，但這輪我會先用最小改動修掉。