#!/bin/bash
# Validates that the new game mechanics API specs are complete and consistent.
# Exit code 0 = all checks pass, 1 = failures found.

set -euo pipefail

SPEC_DIR="openspec/changes/2026-03-05-new-game-mechanics-api/specs"
DESIGN_DOC="docs/plans/2026-03-05-new-game-mechanics-api-design.md"
PROPOSAL="openspec/changes/2026-03-05-new-game-mechanics-api/proposal.md"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local result="$2"
  if [ "$result" = "true" ]; then
    echo "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== API Spec Validation ==="
echo ""

# 1. Check all required spec files exist
echo "1. Spec files exist:"
REQUIRED_SPECS=(
  "hint-system"
  "streak-tracking"
  "yesterday-reveal"
  "enhanced-feedback"
  "difficulty-tiers"
  "profile-update"
  "phone-metadata"
)
for spec in "${REQUIRED_SPECS[@]}"; do
  check "$spec/spec.md" "$([ -f "$SPEC_DIR/$spec/spec.md" ] && echo true || echo false)"
done

# 2. Check proposal and design doc exist
echo ""
echo "2. Design artifacts exist:"
check "proposal.md" "$([ -f "$PROPOSAL" ] && echo true || echo false)"
check "design doc" "$([ -f "$DESIGN_DOC" ] && echo true || echo false)"

# 3. Each spec has requirements with scenarios
echo ""
echo "3. Spec content completeness:"
for spec in "${REQUIRED_SPECS[@]}"; do
  file="$SPEC_DIR/$spec/spec.md"
  if [ -f "$file" ]; then
    has_req=$(grep -c "### Requirement:" "$file" 2>/dev/null || echo 0)
    has_scenario=$(grep -c "#### Scenario:" "$file" 2>/dev/null || echo 0)
    check "$spec has requirements ($has_req found)" "$([ "$has_req" -gt 0 ] && echo true || echo false)"
    check "$spec has scenarios ($has_scenario found)" "$([ "$has_scenario" -gt 0 ] && echo true || echo false)"
  fi
done

# 4. Mock mode coverage - each spec should mention mock
echo ""
echo "4. Mock mode behavior documented:"
for spec in "${REQUIRED_SPECS[@]}"; do
  file="$SPEC_DIR/$spec/spec.md"
  if [ -f "$file" ]; then
    has_mock=$(grep -ci "mock" "$file" 2>/dev/null || echo 0)
    check "$spec mentions mock mode ($has_mock refs)" "$([ "$has_mock" -gt 0 ] && echo true || echo false)"
  fi
done

# 5. Design doc covers all endpoints
echo ""
echo "5. Design doc endpoint coverage:"
if [ -f "$DESIGN_DOC" ]; then
  check "POST /api/hint" "$(grep -q 'POST /api/hint' "$DESIGN_DOC" && echo true || echo false)"
  check "GET /api/streak" "$(grep -q 'GET /api/streak' "$DESIGN_DOC" && echo true || echo false)"
  check "GET /api/puzzle/yesterday" "$(grep -q 'GET /api/puzzle/yesterday' "$DESIGN_DOC" && echo true || echo false)"
  check "POST /api/profile/update" "$(grep -q 'POST /api/profile/update' "$DESIGN_DOC" && echo true || echo false)"
  check "POST /api/guess enhanced" "$(grep -q 'Enhanced Feedback' "$DESIGN_DOC" && echo true || echo false)"
  check "GET /api/puzzle/today difficulty" "$(grep -q 'Difficulty' "$DESIGN_DOC" && echo true || echo false)"
fi

# 6. Schema changes documented
echo ""
echo "6. Schema changes documented:"
if [ -f "$DESIGN_DOC" ]; then
  check "phones table changes" "$(grep -q 'release_year\|releaseYear' "$DESIGN_DOC" && echo true || echo false)"
  check "hints table" "$(grep -q 'hints' "$DESIGN_DOC" && echo true || echo false)"
  check "phone_facts table" "$(grep -q 'phone_facts' "$DESIGN_DOC" && echo true || echo false)"
fi

# 7. Design doc has key sections
echo ""
echo "7. Design doc structure:"
if [ -f "$DESIGN_DOC" ]; then
  check "New Endpoints section" "$(grep -q '## New Endpoints' "$DESIGN_DOC" && echo true || echo false)"
  check "Modified Endpoints section" "$(grep -q '## Modified Endpoints' "$DESIGN_DOC" && echo true || echo false)"
  check "Schema Changes section" "$(grep -q '## Schema Changes' "$DESIGN_DOC" && echo true || echo false)"
  check "Mock Mode section" "$(grep -q '## Mock Mode' "$DESIGN_DOC" && echo true || echo false)"
  check "Caching Strategy section" "$(grep -q '## Caching' "$DESIGN_DOC" && echo true || echo false)"
fi

# Summary
echo ""
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Total:  $((PASS + FAIL))"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "VALIDATION FAILED"
  exit 1
else
  echo ""
  echo "ALL CHECKS PASSED"
  exit 0
fi
