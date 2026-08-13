#!/bin/bash
#
# Fetch commits from a running Claude sandbox and inspect them locally,
# without touching the real `development` branch.
#
# Usage: verify-sandbox.sh <sandbox-name> [branch-to-check]
#   sandbox-name    Name passed to `sbx create --clone --name <sandbox-name> ...`
#   branch-to-check Branch on the sandbox to pull from (default: development)
#
# Create the sandbox with --clone. That flag makes the agent work on a private
# in-container clone and gives the host a `sandbox-<name>` git remote, which is
# what this script fetches from. Without --clone there is no remote to fetch:
#
#   sbx create --clone --name updated-project claude .
#   sbx run --name updated-project
#   ./scripts/verify-sandbox.sh updated-project
#
# Run this from your Macbook (not inside the sandbox) while the sandbox
# is still up, since the git-daemon remote dies with the sandbox.

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
  echo "Two things create it: the sandbox must be running, and it must have been" >&2
  echo "created with --clone (sbx create --clone --name $SANDBOX_NAME claude .)." >&2
  echo "List your sandboxes with: sbx ls" >&2
  AVAILABLE="$(git remote | grep '^sandbox-' || true)"
  if [ -n "$AVAILABLE" ]; then
    echo "Sandbox remotes this repo already knows about:" >&2
    echo "$AVAILABLE" | sed 's/^sandbox-/  /' >&2
  fi
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
