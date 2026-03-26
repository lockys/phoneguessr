# Admin Phone Catalog Page — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

A dedicated admin-only page at `/admin` that lets administrators browse the full phone catalog, search by name, edit a phone's brand/model/imageUrl inline, and delete phones from the database.

---

## Scope

**In scope:**
- List all phones (paginated, 20 per page)
- Search/filter by brand or model (client-side, instant)
- Inline row edit: brand, model, imageUrl
- Delete a phone (with confirmation)
- Auth guard: non-admin users redirected to `/`

**Out of scope:**
- Adding new phones (use existing seed pipeline)
- Managing daily puzzle assignments (`daily_puzzles` table)
- Editing other phone fields (releaseYear, priceTier, difficulty, active toggle)

---

## Architecture

### New Files

| File | Purpose |
|------|---------|
| `phoneguessr/src/routes/admin/page.tsx` | React page component, admin guard, table UI |
| `api/admin/phones.ts` | Serverless function: GET list, PATCH update, DELETE |

### Modified Files

None. The admin route is fully additive.

---

## API — `api/admin/phones.ts`

All endpoints require a valid session with `isAdmin = true`. Returns `403` otherwise.

### GET `/api/admin/phones`

Returns the full phone catalog.

**Response:**
```json
{
  "phones": [
    { "id": 1, "brand": "Apple", "model": "iPhone 15 Pro", "imageUrl": "https://…", "active": true }
  ],
  "total": 130
}
```

### PATCH `/api/admin/phones?id=<phoneId>`

Updates brand, model, and/or imageUrl for a single phone.

**Request body:**
```json
{ "brand": "Apple", "model": "iPhone 15 Pro Max", "imageUrl": "https://…" }
```

**Response:** `{ "success": true, "phone": { …updated fields… } }`

**Validation:** All three fields are optional strings; at least one must be present.

### DELETE `/api/admin/phones?id=<phoneId>`

Deletes a phone record. Returns `409` if the phone is referenced by an active daily puzzle.

**Response:** `{ "success": true }` or `{ "error": "Phone is used in a daily puzzle" }`

---

## Frontend — `phoneguessr/src/routes/admin/page.tsx`

### Auth Guard

On mount, fetches `/api/auth/me`. If the response has `isAdmin !== true` or returns an error, redirects to `/`.

### State

```ts
phones: Phone[]          // full list from API
filtered: Phone[]        // after search filter applied
page: number             // current page (1-indexed)
editingId: number | null // which row is in edit mode
editDraft: { brand, model, imageUrl } | null
searchQuery: string
loading: boolean
error: string | null
```

### Layout

```
┌─────────────────────────────────────────────────────┐
│ 📱 Phone Catalog        130 phones    ← Back to game │
├─────────────────────────────────────────────────────┤
│ 🔍 Search by brand or model…                         │
├──────┬────────┬──────────┬──────────────┬──────┬────┤
│ IMG  │ Brand  │ Model    │ Image URL    │Active│    │
├──────┼────────┼──────────┼──────────────┼──────┼────┤
│ 🖼   │ Apple  │ iPhone…  │ https://…    │ ✓    │Edit│
├──────┴────────┴──────────┴──────────────┴──────┴────┤
│  [Editing row — inline inputs for brand/model/url]  │
│                                     [Save]  [Cancel]│
├──────┬────────┬──────────┬──────────────┬──────┬────┤
│ 🖼   │ Google │ Pixel 9  │ https://…    │  —   │Edit│
└──────┴────────┴──────────┴──────────────┴──────┴────┘
│  ← Prev   [1] 2  3  Next →                          │
└─────────────────────────────────────────────────────┘
```

### Interactions

**Search:** `searchQuery` filters `phones` on `brand + model` (case-insensitive, client-side). Resets to page 1 on change.

**Edit:** Clicking **Edit** sets `editingId` and populates `editDraft` with the row's current values. Only one row can be in edit mode at a time — clicking Edit on another row cancels the current edit. Clicking **Save** calls `PATCH /api/admin/phones?id=X`, updates the local array on success, collapses the row. Clicking **✕** cancels without saving.

**Delete:** Clicking **Del** shows `window.confirm("Delete [Brand Model]? This cannot be undone.")`. On confirm, calls `DELETE /api/admin/phones?id=X`. On `409` (phone in active puzzle), shows an inline error message instead of deleting.

**Pagination:** 20 phones per page. Applied after search filtering.

### Styling

Uses the same CSS variables (`--surface`, `--text`, `--text-muted`, `--border`, etc.) already defined in `index.css`. Admin page gets its own `admin.css` file co-located in `routes/admin/`.

---

## Auth Pattern

Reuses the existing `requireAdmin()` helper from `api/admin/reset.ts` (copy the pattern — check JWT cookie, verify `isAdmin` in DB, return 403 if not). No shared utility needed to keep changes minimal.

---

## Error Handling

| Scenario | Behaviour |
|----------|-----------|
| Not admin | Redirect to `/` on page load |
| API fetch fails | Show inline error banner, retry button |
| PATCH fails | Show error message below the editing row |
| DELETE blocked (409) | Show "This phone is used in a scheduled puzzle" inline |
| Network error | Show error, row stays in edit mode |

---

## Out-of-Scope Guardrails

- No create-new-phone form (phones added via seed pipeline)
- No bulk operations
- No daily puzzle scheduling UI
