#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[agent] Running backend lint fixes..."
if [ -d backend ]; then
  (cd backend && npm ci --silent || true)
  (cd backend && npm run lint:fix || true)
else
  echo "[agent] backend folder not found, skipping"
fi

echo "[agent] Running frontend lint fixes..."
if [ -d frontend ]; then
  (cd frontend && npm ci --silent || true)
  (cd frontend && npm run lint -- --fix || true)
else
  echo "[agent] frontend folder not found, skipping"
fi

echo "[agent] Running basic tests (non-fatal)..."
(cd backend && npm test || true)
(cd frontend && npm test || true)

# Check for changes
if [ -n "$(git status --porcelain)" ]; then
  BRANCH="agent/lint-fixes-local-$(date +%Y%m%d%H%M%S)"
  git switch -c "$BRANCH"
  git add -A
  git commit -m "chore(agent): local autofix lint issues" || true
  git push -u origin "$BRANCH"
  echo "[agent] Created branch $BRANCH and pushed to origin."

  if command -v gh >/dev/null 2>&1; then
    echo "[agent] Creating draft PR using gh CLI..."
    gh pr create --title "chore(agent): local autofix lint issues" --body "This draft PR was created by the local agent lint fixer. Please review and merge if appropriate." --draft || true
  else
    echo "[agent] gh CLI not found. To create a PR manually run:"
    echo "  gh pr create --title \"chore(agent): local autofix lint issues\" --body \"Review lint fixes.\" --draft"
  fi
else
  echo "[agent] No changes from lint fixes. Nothing to commit."
fi
