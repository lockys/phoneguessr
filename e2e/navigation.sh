#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo "  [navigation] Opening app..."
open_and_wait "$BASE_URL" "PhoneGuessr"

echo "  [navigation] Verifying Game panel is default..."
assert_contains "Game panel visible" "PhoneGuessr"

# Scroll to Leaderboard panel (swipe left)
echo "  [navigation] Navigating to Leaderboard..."
$AB eval "document.querySelector('.swipe-container').scrollBy({left: window.innerWidth, behavior: 'smooth'})" 2>/dev/null
sleep 2

assert_contains "Leaderboard visible" "leaderboard\|Leaderboard\|排行榜\|ランキング\|리더보드"

# Scroll back to Game panel
echo "  [navigation] Navigating back to Game..."
$AB eval "document.querySelector('.swipe-container').scrollBy({left: -window.innerWidth, behavior: 'smooth'})" 2>/dev/null
sleep 2

assert_contains "Game panel restored" "PhoneGuessr"

echo "  [navigation] All navigation tests passed!"
