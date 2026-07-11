#!/bin/sh
set -eu

WORKTREE_ROOT=${CODEX_WORKTREE_PATH:-$(pwd)}
MAIN_GIT_WORKTREE=${CODEX_SOURCE_TREE_PATH:-${1:-}}

if [ -z "$MAIN_GIT_WORKTREE" ]; then
  git_common=$(git -C "$WORKTREE_ROOT" rev-parse --git-common-dir 2>/dev/null || true)
  if [ -n "$git_common" ]; then
    case "$git_common" in
      /*) git_common_abs=$git_common ;;
      *) git_common_abs=$(cd "$WORKTREE_ROOT" && cd "$(dirname "$git_common")" && pwd)/$(basename "$git_common") ;;
    esac
    MAIN_GIT_WORKTREE=$(dirname "$git_common_abs")
  fi
fi

if [ -z "$MAIN_GIT_WORKTREE" ]; then
  printf '[codex-worktree-bootstrap] main worktree could not be inferred\n'
  exit 1
fi

bootstrap_script=$WORKTREE_ROOT/.zed/worktree-bootstrap.sh
if [ ! -f "$bootstrap_script" ]; then
  bootstrap_script=$MAIN_GIT_WORKTREE/.zed/worktree-bootstrap.sh
fi

sh "$bootstrap_script" "$WORKTREE_ROOT" "$MAIN_GIT_WORKTREE"
