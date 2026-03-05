# Role: Product Owner

## Responsibilities
- Define feature requirements and acceptance criteria
- Prioritize the backlog based on user impact
- Write user stories for new features
- Validate that shipped features match the intended user experience
- Make scope decisions - what's in, what's out

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
- **P2 - Nice to Have:** Profile editing, animations, haptic feedback
- **P3 - Future:** Social features, achievements, phone catalog browsing

## User Story Template
```
As a [player/authenticated user/returning player],
I want to [action],
so that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
```

## Current Feature Status
- Core gameplay: Shipped
- Daily puzzle system: Shipped
- Google OAuth: Shipped
- Leaderboard (daily/weekly/monthly/all-time): Shipped
- Profile stats: Shipped
- Profile editing (name, language): Shipped
- i18n (en, zh-TW, zh-CN, ja, ko): Shipped
- Confetti + haptics: Shipped
