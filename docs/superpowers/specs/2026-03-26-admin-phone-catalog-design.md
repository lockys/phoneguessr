# Admin Phone Catalog Page — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

A dedicated admin-only page at `/admin` that lets administrators browse the full phone catalog, search by name, edit a phone's brand/model/imageUrl inline, and delete phones from the database.

---

## Scope

**In scope:**
- List all phones (loaded in full, paginated client-side at 20 per page)
- Search/filter — single input, substring match on `brand + " " + model`, case-insensitive, resets to page 1
- Inline row edit: brand, model, imageUrl
- Delete a phone (with window.confirm, English-only — admin pages have no i18n requirement)
- Auth guard: non-admin users redirected to `/`

**Out of scope:** Adding new phones, managing daily puzzle assignments, editing other fields (active, difficulty, etc.), bulk operations.

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `phoneguessr/src/routes/admin/page.tsx` | React page, admin guard, table UI |
| `phoneguessr/src/routes/admin/admin.css` | Admin-specific styles |
| `api/admin/phones.ts` | GET / PATCH / DELETE handler |

### Modified Files

None. `vercel.json` does not need changes — a single `api/admin/phones.ts` file handles all HTTP methods via `req.method` dispatch.

### Route Registration

Modern.js auto-registers `/admin` from `routes/admin/page.tsx` with no config changes. No `layout.tsx` is created — the admin page intentionally sits outside the game layout (no swipe panels, no app header). The existing `routes/layout.tsx` wraps only routes under `routes/`, and adding a sub-directory `routes/admin/` without its own `layout.tsx` inherits no layout.

---

## API — `api/admin/phones.ts`

### Admin Auth Pattern

Copy the pattern used in `api/admin/reset.ts`:
1. Parse the `phoneguessr_session` JWT cookie using `verifySessionToken()` from `phoneguessr/src/lib/auth.ts`.
2. Look up `users.isAdmin` in the database using the `userId` from the JWT payload (Drizzle query).
3. If the user is not found or `isAdmin !== true`, return `403 { error: "Forbidden" }`.

### GET `/api/admin/phones`

Returns the **full** phone catalog (no server-side pagination).

**Response 200:**
```json
{
  "phones": [
    { "id": 1, "brand": "Apple", "model": "iPhone 15 Pro", "imageUrl": "https://…", "active": true }
  ],
  "total": 130
}
```

### PATCH `/api/admin/phones?id=<phoneId>`

**Merge semantics:** Only the provided fields are updated; omitted fields are left unchanged in the database.

**Request body:** `{ brand?: string, model?: string, imageUrl?: string }` — at least one field required; any present field must be a non-empty string.

**Validation error → 400:** `{ "error": "brand must be a non-empty string" }`

**Success → 200:** Returns the full updated phone row (same shape as GET list item):
```json
{ "success": true, "phone": { "id": 1, "brand": "Apple", "model": "iPhone 15 Pro Max", "imageUrl": "https://…", "active": true } }
```

### DELETE `/api/admin/phones?id=<phoneId>`

**Hard-deletes** the row from the `phones` table.

Before deleting, checks whether any row in `daily_puzzles` references this `phoneId`. If found, returns 409.

**Success → 200:** `{ "success": true }`

**Blocked → 409:** `{ "error": "Phone is used in a daily puzzle" }`

---

## Frontend — `phoneguessr/src/routes/admin/page.tsx`

### Auth Guard

Uses the existing `useAuth()` hook from `phoneguessr/src/lib/auth-context.tsx`. On mount (after auth context resolves), if `user === null || user.isAdmin !== true`, call `window.location.href = "/"`. Show a neutral loading indicator until auth state is known (prevents flash of admin content).

### State

```ts
phones: Phone[]             // full list from GET, shape: {id, brand, model, imageUrl, active}
page: number                // current page (1-indexed)
searchQuery: string
editingId: number | null    // id of row currently open for editing; null = none
editDraft: { brand: string; model: string; imageUrl: string } | null
                            // initialized from the row's current values when Edit is clicked
mutating: boolean           // true while any PATCH or DELETE is in flight
globalLoading: boolean      // true only during initial GET
loadError: string | null    // error from initial GET
editError: string | null    // error from a PATCH; shown below the open edit row; cleared when editingId changes
deleteError: { id: number; message: string } | null
                            // error from a DELETE 409; shown below that row; auto-clears after 4s
```

`editError` and `deleteError` are **separate fields** to avoid ambiguity when both a delete error and an edit operation are active simultaneously. `editError` is cleared whenever `editingId` changes (i.e., when the user cancels or opens a different row).

### Computed

```ts
filtered = phones.filter(p =>
  `${p.brand} ${p.model}`.toLowerCase().includes(searchQuery.toLowerCase())
)
paginated = filtered.slice((page - 1) * 20, page * 20)
totalPages = Math.ceil(filtered.length / 20)
```

### Layout

```
┌─────────────────────────────────────────────────────┐
│ 📱 Phone Catalog   <total> phones   ← Back to game  │
├─────────────────────────────────────────────────────┤
│ 🔍 Search by brand or model…                         │
├──────┬──────────┬──────────────┬────────────┬───┬───┤
│ IMG  │ Brand    │ Model        │ Image URL  │Act│   │
├──────┼──────────┼──────────────┼────────────┼───┼───┤
│ 🖼   │ Apple    │ iPhone 15 Pro│ https://…  │ ✓ │Edit Del│
├──────┴──────────┴──────────────┴────────────┴───┴───┤
│  Brand: [_______]  Model: [_______]  URL: [________]│
│  editError shown here (if any)                      │
│                                     [Save]  [Cancel]│
├──────┬──────────┬──────────────┬────────────┬───┬───┤
│ 🖼   │ Google   │ Pixel 9      │ https://…  │ — │Edit Del│
│  deleteError shown here (if DELETE 409 on this row) │
└──────┴──────────┴──────────────┴────────────┴───┴───┘
│  ← Prev   [1] 2  3  Next →                          │
└─────────────────────────────────────────────────────┘
```

**`active` column:** Display-only. "✓" in green if `active = true`; "—" in muted color if false. Not editable.

### Interaction Details

**Search:** Live substring filter on `brand + " " + model`. Resets `page = 1` on every keystroke.

**Edit:**
1. Click **Edit** → `editingId = phone.id`, `editDraft = { brand, model, imageUrl }` from that row. Clears any open `editError`. Opening a different row closes the previous one without prompting.
2. Click **Save** → `mutating = true`. Call `PATCH`. On success: splice updated phone into `phones[]`, `editingId = null`, `editDraft = null`, `editError = null`, `mutating = false`. On error: `editError = message`, `mutating = false` (row stays open).
3. Click **Cancel** → `editingId = null`, `editDraft = null`, `editError = null`.
4. Save and Cancel buttons are disabled while `mutating = true`.

**Delete:**
1. `window.confirm("Delete [Brand] [Model]? This cannot be undone.")` — synchronous, no request yet.
2. On confirm: `mutating = true`. Call `DELETE`.
3. On `200`: splice phone out of `phones[]`. `mutating = false`.
4. On `409`: `deleteError = { id: phone.id, message: "This phone is used in a scheduled puzzle" }`. `mutating = false`. Auto-clear `deleteError` after 4 seconds.
5. All Edit and Del buttons in the table are disabled while `mutating = true`.

**Pagination:** Prev/Next buttons and numbered page buttons. Prev disabled on page 1, Next disabled on last page.

### Loading States

- **`globalLoading = true`** (initial GET only): render a single "Loading…" line in place of the table.
- **`mutating = true`** (PATCH or DELETE in flight): table renders normally but all Edit/Del/Save/Cancel buttons are disabled. No full-page spinner.

### Styling (`admin.css`)

- Dark background matching the app: `background: #0d1117`, `color: var(--text)`
- Table: CSS grid layout (not `<table>` element) — columns `56px 1fr 1fr 2fr 60px 120px`
- Edit row: highlighted with a left border `3px solid var(--accent)` and slightly lighter background
- Buttons: reuse app button styles from `index.css` where possible; add admin-specific overrides in `admin.css`
- Error text: `color: var(--red)`, `font-size: 12px`
- Active ✓: `color: var(--green)` / muted `—`: `color: var(--text-muted)`

---

## Error Handling Summary

| Scenario | Behaviour |
|----------|-----------|
| Not admin / not logged in | Redirect to `/` after auth resolves |
| Initial GET fails | `loadError` banner with retry button |
| PATCH validation (400) | `editError` below edit row; row stays open |
| PATCH server error (500) | Same as 400 |
| DELETE blocked (409) | `deleteError` below that row, auto-clears 4s |
| Network error on PATCH/DELETE | Same as server error; `mutating` reset to false |
