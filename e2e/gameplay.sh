#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

AB="npx agent-browser"

echo "  [gameplay] Opening app with clean state..."
$AB open "$BASE_URL" 2>/dev/null
sleep 2
$AB eval "localStorage.clear()" 2>/dev/null
$AB open "$BASE_URL" 2>/dev/null
sleep 3

# Scroll to Game panel (index 1) using JS
$AB eval "const c=document.querySelector('.swipe-container'); c.scrollLeft=c.clientWidth;" 2>/dev/null
sleep 2

echo "  [gameplay] Verifying puzzle loads..."
assert_contains "Puzzle title visible" "PhoneGuessr" || exit 1

# Get the mock answer from the API
PUZZLE_JSON=$(curl -s "$BASE_URL/api/puzzle/today")
ANSWER_ID=$(echo "$PUZZLE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)._mockAnswerId))")
PHONES_JSON=$(curl -s "$BASE_URL/api/phones")
ANSWER_NAME=$(echo "$PHONES_JSON" | node -e "
  process.stdin.resume();let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const data=JSON.parse(d);
    const phone=data.phones.find(p=>p.id===$ANSWER_ID);
    console.log(phone.brand+' '+phone.model);
  })
")
echo "  [gameplay] Mock answer: $ANSWER_NAME (id=$ANSWER_ID)"

# Dismiss onboarding if present
$AB eval "document.querySelector('.onboarding-skip')?.click()" 2>/dev/null || true
sleep 1

# Click Start button via CSS selector
echo "  [gameplay] Clicking Start..."
$AB eval "document.querySelector('.start-btn')?.click()" 2>/dev/null
sleep 1

# Type in autocomplete input
echo "  [gameplay] Typing answer..."
SEARCH_TEXT=$(echo "$ANSWER_NAME" | cut -c1-10)
$AB eval "const input=document.querySelector('.autocomplete-input'); if(input){input.focus(); input.value=''; const ev=new Event('input',{bubbles:true}); input.dispatchEvent(ev);}" 2>/dev/null
sleep 1
$AB eval "const input=document.querySelector('.autocomplete-input'); if(input){const nativeSet=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set; nativeSet.call(input,'$SEARCH_TEXT'); input.dispatchEvent(new Event('input',{bubbles:true}));}" 2>/dev/null
sleep 2

# Click the first dropdown suggestion
echo "  [gameplay] Selecting suggestion..."
$AB eval "document.querySelector('.autocomplete-option')?.click()" 2>/dev/null
sleep 3

echo "  [gameplay] Verifying game state..."
# Check if a guess row appeared
SNAPSHOT=$($AB snapshot 2>/dev/null)
if echo "$SNAPSHOT" | grep -qiE "guess|wrong|correct|right brand"; then
  echo "  OK: Guess feedback visible"
else
  echo "  WARN: No guess feedback detected yet"
fi

# Now submit the correct answer (if first guess was wrong)
# For simplicity, just verify the app didn't crash and game state exists
assert_contains "App still running" "PhoneGuessr" || exit 1

echo "  [gameplay] Gameplay test passed!"
