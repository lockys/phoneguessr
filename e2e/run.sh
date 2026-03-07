#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
PORT=8091
BASE_URL="http://localhost:$PORT"

passed=0
failed=0
errors=()

# Start mock server
echo "==> Starting mock dev server on port $PORT..."
cd "$ROOT_DIR/phoneguessr"
PORT=$PORT MOCK_API=true npx modern dev &
SERVER_PID=$!

cleanup() {
  echo ""
  echo "==> Stopping mock server (PID $SERVER_PID)..."
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
  # Close agent-browser
  npx agent-browser close 2>/dev/null || true
}
trap cleanup EXIT

# Wait for server to be ready
echo "==> Waiting for server..."
for i in $(seq 1 30); do
  if curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo "==> Server ready!"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERROR: Server failed to start within 30 seconds"
    exit 1
  fi
  sleep 1
done

# Run each test script
for test_file in "$SCRIPT_DIR"/gameplay.sh "$SCRIPT_DIR"/gameplay-loss.sh "$SCRIPT_DIR"/navigation.sh "$SCRIPT_DIR"/leaderboard.sh "$SCRIPT_DIR"/i18n.sh "$SCRIPT_DIR"/share.sh; do
  test_name="$(basename "$test_file" .sh)"

  if [ ! -f "$test_file" ]; then
    echo "SKIP  $test_name (file not found)"
    continue
  fi

  echo ""
  echo "--- Running: $test_name ---"
  if bash "$test_file" "$BASE_URL"; then
    echo "PASS  $test_name"
    ((passed++))
  else
    echo "FAIL  $test_name"
    ((failed++))
    errors+=("$test_name")
  fi
done

# Report
echo ""
echo "=============================="
echo "E2E Results: $passed passed, $failed failed"
if [ ${#errors[@]} -gt 0 ]; then
  echo "Failed tests: ${errors[*]}"
fi
echo "=============================="

exit "$failed"
