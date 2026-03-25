# Auto-Fix on CI/Vercel Failure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a GitHub Actions workflow that automatically runs Claude Code CLI to fix failures when CI or Vercel deployments fail on `main`, pushing the fix directly and retrying up to 3 times.

**Architecture:** A single workflow file `.github/workflows/auto-fix.yml` triggers on `workflow_run` (CI failure) and `deployment_status` (Vercel failure). It checks out the repo, fetches error logs, runs Claude Code in non-interactive mode with the logs, and pushes any fix commit. A loop cap prevents more than 3 consecutive auto-fix commits.

**Tech Stack:** GitHub Actions, Claude Code CLI (`claude`), Node.js 20, bash

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `.github/workflows/auto-fix.yml` | Entire auto-fix workflow |

---

## Pre-requisites (manual setup — do before running the workflow)

Before the workflow can run, two secrets must be added to the GitHub repo:

1. **`ANTHROPIC_API_KEY`** — Go to repo Settings → Secrets and variables → Actions → New repository secret. Paste your Anthropic API key.

2. **`AUTO_FIX_TOKEN`** — Create a GitHub Personal Access Token (classic) with `repo` scope (includes `contents: write`). Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token. Add it as a repo secret named `AUTO_FIX_TOKEN`.

If branch protection is enabled on `main`, the PAT owner must be an admin or an exception must be added.

---

## Task 1: Create the auto-fix workflow

**Files:**
- Create: `.github/workflows/auto-fix.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/auto-fix.yml` with this exact content:

```yaml
name: Auto-Fix

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
  deployment_status: {}

jobs:
  auto-fix:
    runs-on: ubuntu-latest
    if: |
      (github.event_name == 'workflow_run' && github.event.workflow_run.conclusion == 'failure') ||
      (github.event_name == 'deployment_status' && github.event.deployment_status.state == 'failure')

    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.AUTO_FIX_TOKEN }}
          fetch-depth: 10

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: phoneguessr/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: phoneguessr

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Loop-cap guard
        id: guard
        run: |
          count=$(git log --oneline | awk 'BEGIN{c=0} /^[a-f0-9]+ fix\(auto\):/{c++} !/^[a-f0-9]+ fix\(auto\):/{exit} END{print c}')
          count=${count:-0}
          echo "consecutive_fixes=$count" >> "$GITHUB_OUTPUT"
          if [ "$count" -ge 3 ]; then
            echo "Auto-fix cap reached ($count consecutive fix(auto): commits). Aborting."
            exit 0
          fi

      - name: Fetch CI failure logs
        if: github.event_name == 'workflow_run' && steps.guard.outputs.consecutive_fixes < 3
        id: ci-logs
        env:
          GH_TOKEN: ${{ secrets.AUTO_FIX_TOKEN }}
        run: |
          RUN_ID="${{ github.event.workflow_run.id }}"
          # Download logs for the failed run
          gh run view "$RUN_ID" --log-failed 2>/dev/null > /tmp/failure-logs.txt || \
            gh run view "$RUN_ID" --log 2>/dev/null | tail -200 > /tmp/failure-logs.txt || \
            echo "Could not fetch CI logs for run $RUN_ID" > /tmp/failure-logs.txt

      - name: Fetch Vercel failure logs
        if: github.event_name == 'deployment_status' && steps.guard.outputs.consecutive_fixes < 3
        run: |
          LOG_URL="${{ github.event.deployment_status.log_url }}"
          if [ -n "$LOG_URL" ]; then
            curl -s "$LOG_URL" | tail -200 > /tmp/failure-logs.txt || \
              echo "Could not fetch Vercel logs from $LOG_URL" > /tmp/failure-logs.txt
          else
            echo "Vercel deployment failed. Log URL not available. Check Vercel dashboard." > /tmp/failure-logs.txt
          fi

      - name: Configure git identity
        if: steps.guard.outputs.consecutive_fixes < 3
        run: |
          git config user.name "Auto-Fix Bot"
          git config user.email "auto-fix@users.noreply.github.com"

      - name: Run Claude Code auto-fix
        if: steps.guard.outputs.consecutive_fixes < 3
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          LOGS=$(cat /tmp/failure-logs.txt)
          PROMPT="You are an automated fix agent for the PhoneGuessr repo.

A CI/deployment failure occurred. Here are the logs:

$LOGS

Instructions:
1. Read the failing test/lint/build output and identify the root cause
2. Edit the necessary files to fix the issue
3. Run \`cd phoneguessr && npm run lint\` to verify lint passes
4. Run \`cd phoneguessr && npm run test\` to verify tests pass
5. If both pass, stage and commit with message: \"fix(auto): <brief description>\"
6. Do NOT push — the workflow handles that
7. If you cannot determine a safe fix, create a file \`.auto-fix-failed\` with a brief explanation of why, then stop
8. After committing (or creating .auto-fix-failed), stop — do not take further actions"

          claude -p "$PROMPT" --allowedTools "Edit,Bash,Read,Glob,Grep"

      - name: Push fix or abort
        if: steps.guard.outputs.consecutive_fixes < 3
        run: |
          if [ -f ".auto-fix-failed" ]; then
            echo "Claude could not determine a safe fix:"
            cat .auto-fix-failed
            exit 0
          fi
          # Check if Claude made a commit
          if git diff --quiet HEAD~1 HEAD 2>/dev/null; then
            echo "No changes committed by Claude. Nothing to push."
            exit 0
          fi
          git push origin main
```

- [ ] **Step 2: Verify the file was created**

Run:
```bash
cat .github/workflows/auto-fix.yml
```

Expected: file contents displayed without error.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/auto-fix.yml
git commit -m "feat(ci): add auto-fix workflow for CI and Vercel failures"
```

---

## Task 2: Push and verify workflow appears in GitHub Actions

- [ ] **Step 1: Push to main**

```bash
git push origin main
```

- [ ] **Step 2: Verify the workflow appears in GitHub**

Go to the GitHub repo → Actions tab. You should see "Auto-Fix" listed in the left sidebar under workflows.

Expected: "Auto-Fix" workflow is visible (it will show "This workflow has no runs yet" — that is correct).

- [ ] **Step 3: Verify the workflow YAML is valid**

In the GitHub Actions tab, if the YAML has a syntax error, GitHub shows a red error banner. Confirm no error is shown for the Auto-Fix workflow.

---

## Task 3: Add required secrets to the GitHub repo

This task is manual (cannot be done via CLI without a PAT — do it in the browser).

- [ ] **Step 1: Add `ANTHROPIC_API_KEY` secret**

1. Go to repo on GitHub → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `ANTHROPIC_API_KEY`
4. Value: your Anthropic API key (starts with `sk-ant-`)
5. Click "Add secret"

- [ ] **Step 2: Add `AUTO_FIX_TOKEN` secret**

1. Go to GitHub.com → Settings (your personal settings, top-right avatar) → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Note: `auto-fix-phoneguessr`, Expiration: No expiration (or set a long one)
4. Scopes: check `repo` (includes contents:write, read:repo, etc.)
5. Click "Generate token" and copy the token
6. Go back to repo Settings → Secrets and variables → Actions → New repository secret
7. Name: `AUTO_FIX_TOKEN`, Value: paste the token
8. Click "Add secret"

- [ ] **Step 3: Confirm both secrets exist**

In repo Settings → Secrets and variables → Actions, you should see both `ANTHROPIC_API_KEY` and `AUTO_FIX_TOKEN` listed.

---

## Task 4: Smoke test — trigger a deliberate CI failure and observe the fix

- [ ] **Step 1: Introduce a lint error on main**

Edit `phoneguessr/src/lib/scoring.ts` (or any `.ts` file) and add an unused variable at the top of any function body:

```ts
const _unused = 1
```

Biome will flag this as a lint error.

- [ ] **Step 2: Push to main**

```bash
git add phoneguessr/src/lib/scoring.ts
git commit -m "test: deliberately break lint to test auto-fix"
git push origin main
```

- [ ] **Step 3: Watch CI fail**

Go to GitHub → Actions → CI workflow. Wait for the run triggered by your push to fail on the "Lint" step (~1-2 minutes).

- [ ] **Step 4: Watch Auto-Fix trigger**

After CI fails, the Auto-Fix workflow should start automatically. Go to Actions → Auto-Fix. You should see a new run start within ~30 seconds of CI completing.

Expected: Auto-Fix run appears and runs through its steps.

- [ ] **Step 5: Verify the fix commit**

Once Auto-Fix completes, check `git log` on main:

```bash
git pull origin main
git log --oneline -5
```

Expected: a commit with message `fix(auto): ...` at the tip of main.

- [ ] **Step 6: Verify CI passes on the fix commit**

In GitHub → Actions → CI, check the run triggered by the auto-fix commit. Expected: all steps pass (lint, test, build).

---

## Final Verification

- [ ] `.github/workflows/auto-fix.yml` exists and is valid YAML
- [ ] Both secrets (`ANTHROPIC_API_KEY`, `AUTO_FIX_TOKEN`) are set in repo settings
- [ ] Auto-Fix workflow appears in GitHub Actions tab
- [ ] Smoke test: deliberate lint failure → Auto-Fix triggers → fix commit pushed → CI passes
