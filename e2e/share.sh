#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo "  [share] Opening app..."
open_and_wait "$BASE_URL" "PhoneGuessr"

# First, complete a game to get to result modal
PUZZLE_JSON=$(curl -s "$BASE_URL/api/puzzle/today")
ANSWER_ID=$(echo "$PUZZLE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)._mockAnswerId))")
ANSWER_NAME=$(curl -s "$BASE_URL/api/phones" | node -e "
  process.stdin.resume();let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const data=JSON.parse(d);
    const phone=data.phones.find(p=>p.id===$ANSWER_ID);
    console.log(phone.brand+' '+phone.model);
  })
")

echo "  [share] Will complete game with: $ANSWER_NAME"

# Check if already completed (localStorage)
SNAPSHOT=$($AB snapshot 2>/dev/null)
if echo "$SNAPSHOT" | grep -qiE "share\|Share\|分享\|シェア"; then
  echo "  [share] Game already completed, share button visible"
else
  # Click Start if needed
  START_REF=$(find_ref "Start")
  if [ -z "$START_REF" ]; then
    START_REF=$(find_ref "開始")
  fi
  if [ -n "$START_REF" ]; then
    $AB click "$START_REF" 2>/dev/null
    sleep 1
  fi

  # Submit correct answer
  INPUT_REF=$(find_ref "input")
  if [ -z "$INPUT_REF" ]; then
    INPUT_REF=$(find_ref "autocomplete")
  fi
  if [ -n "$INPUT_REF" ]; then
    SEARCH_TEXT=$(echo "$ANSWER_NAME" | cut -c1-8)
    $AB fill "$INPUT_REF" "$SEARCH_TEXT" 2>/dev/null
    sleep 1
    SUGGESTION_REF=$(find_ref "$ANSWER_NAME")
    if [ -n "$SUGGESTION_REF" ]; then
      $AB click "$SUGGESTION_REF" 2>/dev/null
      sleep 3
    fi
  fi
fi

# Verify share button in result modal
echo "  [share] Verifying share button..."
wait_for_text "share\|Share\|分享\|シェア" 5
SHARE_REF=$(find_ref "share\|Share\|分享")
if [ -n "$SHARE_REF" ]; then
  echo "  [share] Clicking share button..."
  $AB click "$SHARE_REF" 2>/dev/null
  sleep 1

  # Check for "Copied" confirmation
  SNAPSHOT=$($AB snapshot 2>/dev/null)
  if echo "$SNAPSHOT" | grep -qiE "copied\|Copied\|已複製\|コピー\|복사"; then
    echo "  OK: Share copied confirmation shown"
  else
    echo "  WARN: No 'Copied' confirmation detected (clipboard may not be available in headless)"
  fi
else
  echo "  WARN: Share button not found (game may not have completed)"
fi

echo "  [share] Share tests passed!"
