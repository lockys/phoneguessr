#!/usr/bin/env bash
# Shared helpers for E2E tests

AB="npx agent-browser"

# Assert snapshot contains text
assert_contains() {
  local label="$1"
  local text="$2"
  local snapshot
  snapshot=$($AB snapshot 2>/dev/null)
  if echo "$snapshot" | grep -qi "$text"; then
    echo "  OK: $label"
    return 0
  else
    echo "  FAIL: $label — expected to find '$text'"
    echo "  Snapshot excerpt: $(echo "$snapshot" | head -20)"
    return 1
  fi
}

# Assert scoped snapshot contains text
assert_scoped_contains() {
  local label="$1"
  local selector="$2"
  local text="$3"
  local snapshot
  snapshot=$($AB snapshot -s "$selector" 2>/dev/null)
  if echo "$snapshot" | grep -qi "$text"; then
    echo "  OK: $label"
    return 0
  else
    echo "  FAIL: $label — expected '$text' in '$selector'"
    return 1
  fi
}

# Get interactive snapshot and find ref for element matching text
find_ref() {
  local text="$1"
  local snapshot
  snapshot=$($AB snapshot -i 2>/dev/null)
  echo "$snapshot" | grep -i "$text" | head -1 | grep -oE '@e[0-9]+' | head -1
}

# Wait for page to have text (up to N seconds)
wait_for_text() {
  local text="$1"
  local timeout="${2:-10}"
  for i in $(seq 1 "$timeout"); do
    if $AB snapshot 2>/dev/null | grep -qi "$text"; then
      return 0
    fi
    sleep 1
  done
  echo "  TIMEOUT waiting for '$text'"
  return 1
}

# Navigate to page and wait for load
open_and_wait() {
  local url="$1"
  local wait_text="${2:-PhoneGuessr}"
  $AB open "$url" 2>/dev/null
  sleep 2
  wait_for_text "$wait_text" 10
}
