#!/usr/bin/env bash
# Stop hook: auto-commit + push at end of each turn.
# Author is locked to faizvk <faizvk14@gmail.com> regardless of git config.
set -u

REPO="/Users/synup/new project/jobpilot"
AUTHOR="faizvk <faizvk14@gmail.com>"

cd "$REPO" || exit 0

# Bail if not a git repo
git rev-parse --git-dir >/dev/null 2>&1 || exit 0

GIT_DIR=$(git rev-parse --git-dir)

# Bail if a merge/rebase/cherry-pick/bisect is in progress
for marker in MERGE_HEAD REBASE_HEAD CHERRY_PICK_HEAD BISECT_LOG rebase-merge rebase-apply; do
  if [ -e "$GIT_DIR/$marker" ]; then
    exit 0
  fi
done

# Bail if detached HEAD
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null) || exit 0
[ -z "$BRANCH" ] && exit 0

# Bail if no changes
if [ -z "$(git status --porcelain)" ]; then
  # Still push if local is ahead of upstream
  if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
    AHEAD=$(git rev-list --count "@{u}..HEAD" 2>/dev/null || echo 0)
    if [ "${AHEAD:-0}" -gt 0 ]; then
      git push origin "$BRANCH" >/dev/null 2>&1 || true
    fi
  fi
  exit 0
fi

git add -A || exit 0

# Build a short summary from staged changes
SUMMARY=$(git diff --cached --shortstat 2>/dev/null | sed 's/^ *//')
MSG="auto: end-of-turn snapshot"
[ -n "$SUMMARY" ] && MSG="auto: end-of-turn snapshot ($SUMMARY)"

git -c commit.gpgsign=false commit \
  --author="$AUTHOR" \
  --no-verify \
  -m "$MSG" >/dev/null 2>&1 || exit 0

# Push: set upstream on first push, otherwise normal push
if git rev-parse --abbrev-ref --symbolic-full-name "@{u}" >/dev/null 2>&1; then
  git push origin "$BRANCH" >/dev/null 2>&1 || true
else
  git push -u origin "$BRANCH" >/dev/null 2>&1 || true
fi

exit 0
