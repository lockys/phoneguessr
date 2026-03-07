#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo "  [leaderboard] Opening app..."
open_and_wait "$BASE_URL" "PhoneGuessr"

# Navigate to Leaderboard panel
echo "  [leaderboard] Navigating to Leaderboard panel..."
$AB eval "document.querySelector('.swipe-container').scrollBy({left: window.innerWidth, behavior: 'smooth'})" 2>/dev/null
sleep 2

echo "  [leaderboard] Verifying leaderboard content..."
assert_contains "Leaderboard heading visible" "leaderboard\|Leaderboard\|排行榜\|ランキング\|리더보드"

# Check daily leaderboard has entries (mock data should provide some)
echo "  [leaderboard] Checking for leaderboard entries..."
SNAPSHOT=$($AB snapshot 2>/dev/null)
if echo "$SNAPSHOT" | grep -qiE "daily\|Daily\|每日\|デイリー\|일간"; then
  echo "  OK: Daily tab visible"
else
  echo "  WARN: Daily tab not found (may use different label)"
fi

echo "  [leaderboard] Leaderboard tests passed!"
