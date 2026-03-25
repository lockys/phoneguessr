# Auto-Fix on CI/Vercel Failure — Design Spec

**Date:** 2026-03-25
**Status:** Approved

## Goal

When CI (lint/test/build) or a Vercel deployment fails on `main`, a GitHub Actions workflow automatically triggers Claude Code CLI to diagnose the failure, edit files, verify the fix locally, and push a corrected commit to `main`. Retries are capped at 3 consecutive auto-fix commits to prevent infinite loops.

---

## Architecture

A single new file — `.github/workflows/auto-fix.yml` — handles the full flow.

**Triggers:**
- `workflow_run` on the `CI` workflow, activity type `completed`, conclusion `failure`
  - Must use `types: [completed]` explicitly — otherwise the event fires on `requested` too, before CI finishes
- `deployment_status` with state `failure` (Vercel fires this via GitHub's deployment API)

**Flow:**
```
CI fails / Vercel deployment fails
        ↓
auto-fix.yml triggers
        ↓
[Setup] actions/checkout@v4 + actions/setup-node@v4 (Node 20, npm cache)
        ↓
[Install] cd phoneguessr && npm ci
        ↓
[Guard] Count consecutive "fix(auto):" commits in git log
        → ≥ 3? → exit 0 (abort silently)
        ↓
[Fetch logs] GitHub Actions API → get failed job logs (CI)
             deployment_status event payload → log_url (Vercel)
        ↓
[Git config] git config user.name "Auto-Fix Bot"
             git config user.email "auto-fix@users.noreply.github.com"
        ↓
[Claude Code] claude -p "<logs + instructions>" --allowedTools Edit,Bash,Read,Glob,Grep
        → edits files
        → runs: cd phoneguessr && npm run lint && npm run test
        → commits: "fix(auto): <description>"
        ↓
[Push] git push origin main (using AUTO_FIX_TOKEN)
        ↓
CI re-runs → passes → done
              fails → loop repeats (capped at 3)
```

---

## Components

### `.github/workflows/auto-fix.yml`

The only new file. Responsibilities:
1. Check out the repo and set up Node.js
2. Install dependencies (`npm ci`)
3. Run the loop-cap guard
4. Fetch failure logs
5. Configure git identity for bot commits
6. Run Claude Code CLI in non-interactive mode
7. Push fix if Claude made changes
8. Abort cleanly if Claude signals it cannot fix

### Secrets required (set in GitHub repo settings)

| Secret | Purpose |
|--------|---------|
| `ANTHROPIC_API_KEY` | Authenticates Claude Code CLI |
| `AUTO_FIX_TOKEN` | GitHub PAT with `contents: write` — needed to push to `main` and re-trigger CI (GITHUB_TOKEN cannot re-trigger workflows). Owner must be exempt from branch protection rules if any are enabled on `main`. |

### Claude Code invocation

```bash
claude -p "$PROMPT" --allowedTools "Edit,Bash,Read,Glob,Grep"
```

Allowed tools: `Edit`, `Bash`, `Read`, `Glob`, `Grep` — no web access, no git push (workflow owns that).

Note: `--allowedTools` is a supported Claude Code CLI flag. No `--max-turns` flag is used — the prompt instructs Claude to commit and exit when done.

---

## Prompt Design

```
You are an automated fix agent for the PhoneGuessr repo.

A CI/deployment failure occurred. Here are the logs:
<LOGS>

Instructions:
1. Read the failing test/lint/build output and identify the root cause
2. Edit the necessary files to fix the issue
3. Run `cd phoneguessr && npm run lint` to verify lint passes
4. Run `cd phoneguessr && npm run test` to verify tests pass
5. If both pass, stage and commit with message: "fix(auto): <brief description>"
6. Do NOT push — the workflow handles that
7. If you cannot determine a safe fix, create a file `.auto-fix-failed`
   with a brief explanation of why, then exit 0
8. After committing (or creating .auto-fix-failed), stop — do not take further actions
```

The workflow checks for `.auto-fix-failed` after Claude exits. If present → abort (no push).
The workflow checks `git diff HEAD` for staged changes. If none → abort (nothing to push).

---

## Loop Cap

Before running Claude, the workflow counts consecutive `fix(auto):` commits at the tip of `main`:

```bash
count=$(git log --oneline | awk 'BEGIN{c=0} /^[a-f0-9]+ fix\(auto\):/{c++} !/^[a-f0-9]+ fix\(auto\):/{exit} END{print c}')
if [ "${count:-0}" -ge 3 ]; then
  echo "Auto-fix cap reached ($count consecutive). Aborting."
  exit 0
fi
```

`BEGIN{c=0}` ensures the count defaults to 0 even when no matching commits exist. `${count:-0}` guards against empty output.

If ≥ 3 consecutive auto-fix commits exist, the workflow exits cleanly — CI will remain failing until a human intervenes.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| ≥ 3 consecutive `fix(auto):` commits | Abort silently |
| Claude creates `.auto-fix-failed` | Exit cleanly, no push |
| Claude makes no changes | Exit cleanly, no push |
| `claude` CLI exits non-zero | Workflow step fails — visible in Actions UI |
| Push rejected | Workflow fails — visible in Actions UI |
| Vercel log URL unavailable | Fall back to generic failure message; Claude still attempts fix |
| Branch protection blocks push | `AUTO_FIX_TOKEN` owner must have admin bypass or be exempt |

---

## Vercel Failure Detection

Vercel updates GitHub deployment statuses via its GitHub App. This fires the `deployment_status` event. The workflow filters on:

```yaml
if: github.event.deployment_status.state == 'failure'
```

The Vercel deployment log URL is available at `github.event.deployment_status.log_url`.

---

## Runner Environment

The workflow runs on `ubuntu-latest`. Required setup steps before Claude runs:

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.AUTO_FIX_TOKEN }}  # needed to push later
    fetch-depth: 10  # enough for loop-cap git log check

- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: npm
    cache-dependency-path: phoneguessr/package-lock.json

- run: npm ci
  working-directory: phoneguessr
```

---

## Out of Scope

- Telegram notifications (can be added later)
- Opening PRs instead of pushing directly
- Fixing Vercel environment variable or infra issues (Claude can only fix code)
- Auto-rollback of the broken commit
