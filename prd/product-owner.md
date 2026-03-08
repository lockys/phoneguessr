# Role: Product Owner

## Responsibilities
- Define feature requirements and acceptance criteria
- Prioritize the backlog based on user impact
- Write user stories for new features
- Validate that shipped features match the intended user experience
- Make scope decisions — what's in, what's out

## Product Overview
PhoneGuessr is a daily phone guessing game where players identify smartphones from cropped photos. One puzzle per day, 6 guesses max, with scoring based on time + penalties.

## Core User Journey
1. Player opens the app and sees a phone image hidden behind blocks
2. Taps "Start" to begin the timer
3. Types a phone name into the autocomplete input
4. Receives feedback: correct, right brand, or wrong brand
5. Each wrong guess reveals more of the image
6. Game ends on correct guess or after 6 attempts
7. Player can share their result and view the leaderboard

## Feature Prioritization Framework
- **P0 - Must Have:** Core gameplay loop, daily puzzle, basic feedback
- **P1 - Should Have:** Leaderboard, stats tracking, auth, i18n
- **P2 - Nice to Have:** Profile editing, animations, haptic feedback, anti-cheat
- **P3 - Future:** Social features, achievements, phone catalog browsing

## Current Feature Status
- Core gameplay: Shipped
- Daily puzzle system: Shipped
- Google OAuth: Shipped
- Database game state (authed users): Shipped
- Leaderboard (daily/weekly/monthly/all-time): Shipped
- Profile stats + editing: Shipped
- i18n (en, zh-TW, zh-CN, ja, ko): Shipped
- Confetti + haptics: Shipped

---

## Upcoming Features

### P1: Image Anti-Cheat (Prevent network-tab cheating)
> OpenSpec: `openspec/changes/image-anti-cheat/`

**User Story:** As a player, I want the game to be fair, so that no one can cheat by inspecting network traffic.

**Acceptance Criteria:**
- [ ] During gameplay, only a cropped region of the phone image is transmitted (not the full image)
- [ ] Requesting a higher crop level than earned returns a 403 error
- [ ] The full image is only sent after the game ends (win or all 6 guesses used)
- [ ] Anonymous users have the same anti-cheat protection via signed tokens
- [ ] Visual experience is identical to current behavior (same zoom levels)

### P1: Passkey Biometric Login
> OpenSpec: `openspec/changes/passkey-auth/`

**User Story:** As a returning player, I want to sign in with my fingerprint or face, so that I don't have to go through Google OAuth every time.

**Acceptance Criteria:**
- [ ] Authenticated users can register a passkey from their profile
- [ ] "Sign in with Passkey" button appears alongside Google OAuth on supported browsers
- [ ] Passkey login creates the same session as Google OAuth (transparent to the app)
- [ ] Passkey button is hidden on browsers without WebAuthn support
- [ ] Existing Google OAuth flow is completely unaffected

### P2: Expanded Phone Catalog (130+ brands)
> OpenSpec: `openspec/changes/phone-image-collection/`

**User Story:** As a player, I want a wide variety of phones to guess, so that the game stays fresh and challenging across many days.

**Acceptance Criteria:**
- [ ] Catalog expands from 20 to 400-650 phones across 130+ brands
- [ ] All phone images are high-quality JPEGs suitable for the guessing game
- [ ] Difficulty distribution: 20% easy, 25% medium, 30% hard
- [ ] Original 20 phones preserved (backward compatible)
- [ ] Mock mode updated with representative sample (60-80 phones)

### P1: Test Coverage (Prevent regressions)
> OpenSpec: `openspec/changes/test-coverage/`

**User Story:** As a developer, I want comprehensive test coverage, so that I can add features and refactor without breaking existing functionality.

**Acceptance Criteria:**
- [ ] Game.tsx has thorough unit tests covering all game states
- [ ] All 11 API endpoints have unit tests
- [ ] Auth flow (token creation, verification, OAuth) is tested
- [ ] Coverage: 80%+ for critical paths, 60%+ overall
- [ ] All existing 244 tests continue to pass
