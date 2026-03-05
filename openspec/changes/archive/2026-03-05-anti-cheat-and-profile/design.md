## Context

PhoneGuessr serves phone images as static files with filenames like `apple-iphone-16-pro-max.jpg`. The filename reveals the answer. The puzzle API returns `imagePath` as a direct URL. The app uses Modern.js BFF with Hono for API routes and has a mock API mode for local development. The UI now uses a swipeable panel container.

## Goals / Non-Goals

**Goals:**
- Prevent players from identifying the phone via image URL, filename, or network inspection
- Serve images through a backend endpoint that returns base64-encoded data
- Add profile stats and about/author panels as swipeable pages
- Support all new endpoints in mock API mode

**Non-Goals:**
- DRM-level protection (determined users can always screenshot)
- Preventing right-click save (CSS pointer-events already blocks this)
- Server-side session validation for image access (would complicate anonymous play)
- Persistent profile data storage (profile stats derive from existing result data)

## Decisions

### 1. Base64 image serving via API endpoint
**Decision**: Create `GET /api/puzzle/image` that reads the image file from disk, converts to base64 data URL, and returns it as JSON (`{ imageData: "data:image/jpeg;base64,..." }`). The puzzle today endpoint returns `imageUrl: "/api/puzzle/image"` instead of a file path.

**Alternatives considered**:
- **Proxy endpoint streaming binary**: More efficient but still exposes content-type headers. Base64 in JSON is simpler and keeps the response format consistent.
- **Encrypted image with client-side decryption key**: Over-engineered for a casual game. The goal is to remove obvious cheating, not prevent determined reverse engineering.

**Rationale**: Base64 is simple, works with `<img src="data:...">`, and reveals nothing about the phone identity. The image data is ~50-100KB base64 which is acceptable for a single image.

### 2. Mock image endpoint
**Decision**: In mock mode, the image endpoint reads from `config/public/phones/` using the mock puzzle's image path and converts to base64. This keeps mock behavior identical to production.

### 3. Profile panel — client-derived stats
**Decision**: Profile stats (games played, wins, win rate, streak) are computed from localStorage game history on the client side. No new server endpoint needed for anonymous users. For authenticated users, add a `GET /api/profile/stats` endpoint that aggregates from the results table.

### 4. Panel order in SwipeContainer
**Decision**: Four panels — Profile (left-most), Game (default/center), Leaderboard, About (right-most). Game remains the default active panel on load.

Panel order: `[Profile, Game, Leaderboard, About]` with default index 1 (Game).

### 5. About page — static content
**Decision**: About page content is hardcoded in the component (game title, description, rules, author credit). No API needed — it's purely static.

## Risks / Trade-offs

- **Base64 increases response size ~33%** → Acceptable for single images (typical phone photos are 50-150KB). Could add server-side compression if needed later.
- **Image caching lost** → Static files are cached by browser; API responses need explicit cache headers. Mitigation: Add `Cache-Control` header to image endpoint for same-day caching.
- **localStorage stats can be cleared** → Profile stats for anonymous users are best-effort. Authenticated users get server-derived stats.
