#!/usr/bin/env bash
set -euo pipefail

if [[ "$GITHUB_REF" != "refs/heads/master" ]]; then
  echo "Create PRD Release Branch must run from master; received: $GITHUB_REF" >&2
  exit 1
fi

release_date="$(TZ=Asia/Ho_Chi_Minh date +%Y%m%d)"
if [[ ! "$release_date" =~ ^[0-9]{8}$ ]]; then
  echo "Expected release date format YYYYMMDD; received: $release_date" >&2
  exit 1
fi
parsed_date="$(date -u -d "$release_date" +%Y%m%d)"
if [[ "$parsed_date" != "$release_date" ]]; then
  echo "Invalid calendar date: $release_date" >&2
  exit 1
fi

release_branch="release/homelab/$release_date"
if gh api "repos/$GH_REPOSITORY/git/ref/heads/$release_branch" >/dev/null 2>&1; then
  echo "Release branch $release_branch already exists." >&2
  exit 1
fi
if gh api "repos/$GH_REPOSITORY/git/ref/tags/$release_date" >/dev/null 2>&1; then
  echo "Release tag $release_date already exists." >&2
  exit 1
fi
if gh release view "$release_date" --repo "$GH_REPOSITORY" >/dev/null 2>&1; then
  echo "GitHub Release $release_date already exists." >&2
  exit 1
fi

source_sha="$(gh api "repos/$GH_REPOSITORY/branches/master" --jq .commit.sha)"
if [[ ! "$source_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Could not resolve the current master commit: $source_sha" >&2
  exit 1
fi

gh api --method POST "repos/$GH_REPOSITORY/git/refs" -f "ref=refs/heads/$release_branch" -f "sha=$source_sha" >/dev/null

{
  echo "release_branch=$release_branch"
} >> "$GITHUB_OUTPUT"

{
  echo '## 🌿 Release branch created'
  echo
  echo "- Branch: $release_branch"
  echo "- Cut from master at: $source_sha"
  echo "- Release date/tag: $release_date"
} >> "$GITHUB_STEP_SUMMARY"
