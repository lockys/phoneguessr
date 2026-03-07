## 1. Setup

- [x] 1.1 Install `agent-browser` as a devDependency in `phoneguessr/package.json`
- [x] 1.2 Create `e2e/` directory at repo root and add `e2e/run.sh` runner script (starts mock server, runs tests, reports results, kills server)
- [x] 1.3 Add `"test:e2e": "bash e2e/run.sh"` script to `phoneguessr/package.json`

## 2. Core gameplay test

- [x] 2.1 Create `e2e/gameplay.sh` — load page, verify puzzle image renders, click Start button, type phone name in autocomplete, select suggestion, verify guess row appears with feedback, complete the game (submit correct answer from mock data), verify result modal appears
- [x] 2.2 Add loss scenario to `e2e/gameplay-loss.sh` — submit 6 wrong guesses, verify game ends with loss state

## 3. Navigation test

- [x] 3.1 Create `e2e/navigation.sh` — verify Game panel loads by default, scroll/swipe to Leaderboard panel, verify leaderboard content visible, scroll back to Game panel, verify game state preserved

## 4. Leaderboard test

- [x] 4.1 Create `e2e/leaderboard.sh` — navigate to leaderboard panel, verify daily leaderboard entries display with rank/name/score, switch to weekly tab if available

## 5. I18n test

- [x] 5.1 Create `e2e/i18n.sh` — navigate to Profile panel, find language selector, switch to zh-TW, verify UI text changed to Traditional Chinese, switch back to English, verify UI restored

## 6. Share test

- [x] 6.1 Create `e2e/share.sh` — complete a game (win), verify share button appears in result modal, click share button, verify "Copied" confirmation appears

## 7. Verify

- [x] 7.1 Run `npm run test:e2e` end-to-end and confirm all tests pass against mock mode
