#!/bin/bash
#
# Fetch commits from a running Claude sandbox and inspect them locally,
# without touching the real `development` branch.
#
# Usage: ./scripts/verify-sandbox.sh <sandbox-name> [branch-to-check]
#   sandbox-name    Name passed to `sbx create --name <sandbox-name> ...`
#   branch-to-check Branch on the sandbox to pull from (default: development)
#
# Run this from your Macbook (not inside the sandbox) while the sandbox
# is still up, since it depends on the sandbox's git-daemon remote.

set -euo pipefail

SANDBOX_NAME="${1:?Usage: $0 <sandbox-name> [branch-to-check]}"
SANDBOX_BRANCH="${2:-development}"
REMOTE="sandbox-${SANDBOX_NAME}"
VERIFY_BRANCH="verify-${SANDBOX_NAME}"

if [ -n "$(git status --porcelain)" ]; then
  echo "Error: you have uncommitted changes. Commit or stash them before running this script." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Error: git remote '$REMOTE' not found." >&2
  echo "Is the sandbox '$SANDBOX_NAME' still running? Check with: sbx run --name $SANDBOX_NAME" >&2
  exit 1
fi

echo "==> Fetching from $REMOTE..."
git fetch "$REMOTE"

echo "==> Switching to throwaway branch '$VERIFY_BRANCH' (created or reset to $REMOTE/$SANDBOX_BRANCH)..."
git switch -C "$VERIFY_BRANCH" "$REMOTE/$SANDBOX_BRANCH"

echo "==> Installing dependencies (no-op if nothing changed)..."
pnpm install

cat <<EOF

==> Starting dev server. Review the change in your browser, then Ctrl-C to stop.

When you're done, from any branch:
  Looks good:   git switch development && git merge $VERIFY_BRANCH
  Discard:      git switch development && git branch -D $VERIFY_BRANCH

EOF

pnpm dev
