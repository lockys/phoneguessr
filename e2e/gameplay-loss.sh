#!/usr/bin/env bash
set -uo pipefail

BASE_URL="${1:-http://localhost:8091}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$SCRIPT_DIR/helpers.sh"

echo "  [gameplay-loss] Opening app with clean state..."
$AB open "$BASE_URL" 2>/dev/null
sleep 2

# Clear localStorage to reset game state
$AB eval "localStorage.clear()" 2>/dev/null
$AB open "$BASE_URL" 2>/dev/null
sleep 2

wait_for_text "PhoneGuessr" 10

# Get the mock answer so we know what to AVOID
PUZZLE_JSON=$(curl -s "$BASE_URL/api/puzzle/today")
ANSWER_BRAND=$(echo "$PUZZLE_JSON" | node -e "process.stdin.resume();let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d)._mockAnswerBrand))")

# Get a wrong phone brand to submit repeatedly
PHONES_JSON=$(curl -s "$BASE_URL/api/phones")
WRONG_PHONES=$(echo "$PHONES_JSON" | node -e "
  process.stdin.resume();let d='';
  process.stdin.on('data',c=>d+=c);
  process.stdin.on('end',()=>{
    const data=JSON.parse(d);
    const wrong=data.phones.filter(p=>p.brand!=='$ANSWER_BRAND');
    // Pick 6 different wrong phones
    const picks=wrong.slice(0,6);
    picks.forEach(p=>console.log(p.brand+' '+p.model));
  })
")

echo "  [gameplay-loss] Answer brand: $ANSWER_BRAND"
echo "  [gameplay-loss] Will submit wrong guesses..."

# Click Start
START_REF=$(find_ref "Start")
if [ -z "$START_REF" ]; then
  START_REF=$(find_ref "開始")
fi
if [ -n "$START_REF" ]; then
  $AB click "$START_REF" 2>/dev/null
  sleep 1
fi

# Submit 6 wrong guesses
GUESS_NUM=0
while IFS= read -r wrong_phone; do
  ((GUESS_NUM++))
  if [ "$GUESS_NUM" -gt 6 ]; then break; fi

  echo "  [gameplay-loss] Guess $GUESS_NUM/6: $wrong_phone"

  INPUT_REF=$(find_ref "input")
  if [ -z "$INPUT_REF" ]; then
    INPUT_REF=$(find_ref "autocomplete")
  fi
  if [ -z "$INPUT_REF" ]; then
    echo "  WARN: Cannot find input at guess $GUESS_NUM — game may have ended"
    break
  fi

  SEARCH_TEXT=$(echo "$wrong_phone" | cut -c1-8)
  $AB fill "$INPUT_REF" "$SEARCH_TEXT" 2>/dev/null
  sleep 1

  SUGGESTION_REF=$(find_ref "$wrong_phone")
  if [ -z "$SUGGESTION_REF" ]; then
    # Try partial match
    MODEL=$(echo "$wrong_phone" | cut -d' ' -f2-)
    SUGGESTION_REF=$(find_ref "$MODEL")
  fi

  if [ -n "$SUGGESTION_REF" ]; then
    $AB click "$SUGGESTION_REF" 2>/dev/null
    sleep 1
  else
    echo "  WARN: Could not find suggestion for '$wrong_phone'"
  fi
done <<< "$WRONG_PHONES"

echo "  [gameplay-loss] Verifying loss state..."
sleep 2
# After 6 wrong guesses, game should show loss modal
assert_contains "Loss modal visible" "tomorrow\|Better luck\|明天\|また明日\|내일"

echo "  [gameplay-loss] Loss scenario passed!"
