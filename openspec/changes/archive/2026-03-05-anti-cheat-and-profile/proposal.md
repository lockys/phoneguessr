## Why

Phone images are currently served as static files with predictable filenames (e.g., `/public/phones/apple-iphone-16-pro-max.jpg`). Players can inspect the network tab or image element in devtools to see the phone name in the URL, trivially cheating. Additionally, the app lacks a profile page for personal stats and an about/credits page.

## What Changes

- **Image anti-cheat**: Serve puzzle images through a backend API endpoint that returns base64-encoded image data. Image filenames are never exposed to the client. The puzzle API returns an opaque image endpoint URL (e.g., `/api/puzzle/image`) instead of a direct file path.
- **Profile page**: New swipeable panel showing the user's personal game statistics (games played, win rate, current streak, best streak).
- **About page**: New swipeable panel with game description, rules, credits/author info.
- **Mock API support**: Add mock endpoints for profile stats and about page data.

## Capabilities

### New Capabilities
- `image-protection`: Backend image serving with base64 encoding to prevent filename-based cheating
- `profile-page`: Personal statistics panel with game history summary
- `about-page`: Game info, rules, and author credits panel

### Modified Capabilities
- `daily-puzzle`: Puzzle API returns an opaque image URL instead of a direct file path
- `mock-api`: Add mock endpoints for image serving, profile stats, and about data

## Impact

- `api/lambda/puzzle/today.ts` — Returns opaque image URL instead of file path
- New API endpoint: `api/lambda/puzzle/image.ts` — Serves base64-encoded image
- `src/components/CropReveal.tsx` — Receives base64 data URL instead of file path
- `src/components/Game.tsx` — Fetches image data from API
- `src/mock/state.ts` — Mock image endpoint, profile stats, about data
- `src/routes/page.tsx` — Additional panels in SwipeContainer
- New components: `ProfilePanel`, `AboutPanel`
- `src/routes/index.css` — Styles for new panels
