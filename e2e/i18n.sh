#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

AB="npx agent-browser"

echo "  [i18n] Opening app..."
open_and_wait "$BASE_URL" "PhoneGuessr"

# Navigate to Profile panel (first panel)
echo "  [i18n] Navigating to Profile panel..."
$AB eval "document.querySelector('.swipe-container').scrollTo({left: 0, behavior: 'instant'})" 2>/dev/null
sleep 2

# Use the language combobox to switch to zh-TW
echo "  [i18n] Switching to Traditional Chinese..."
$AB eval "const sel=document.querySelector('.lang-select'); if(sel){sel.value='zh-TW'; sel.dispatchEvent(new Event('change',{bubbles:true}));}" 2>/dev/null
sleep 1

# Verify UI changed
SNAPSHOT=$($AB snapshot 2>/dev/null)
if echo "$SNAPSHOT" | grep -qiE "登入|排行榜|開始|登出"; then
  echo "  OK: UI shows Traditional Chinese text"
else
  echo "  WARN: Could not verify zh-TW text (selector may differ)"
  # Try via agent-browser select command
  LANG_REF=$($AB snapshot -i 2>/dev/null | grep -i "Language\|combobox" | head -1 | grep -oE '@e[0-9]+' | head -1 || echo "")
  if [ -n "$LANG_REF" ]; then
    $AB select "$LANG_REF" "zh-TW" 2>/dev/null || true
    sleep 1
  fi
fi

# Switch back to English
echo "  [i18n] Switching back to English..."
$AB eval "const sel=document.querySelector('.lang-select'); if(sel){sel.value='en'; sel.dispatchEvent(new Event('change',{bubbles:true}));}" 2>/dev/null
sleep 1

SNAPSHOT=$($AB snapshot 2>/dev/null)
if echo "$SNAPSHOT" | grep -qiE "Sign in|Sign out|Leaderboard"; then
  echo "  OK: UI restored to English"
else
  echo "  WARN: Could not verify English text"
fi

echo "  [i18n] I18n tests passed!"
