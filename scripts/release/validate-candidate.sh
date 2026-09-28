#!/usr/bin/env bash
set -euo pipefail

if [[ "$WORKFLOW_REF" != "refs/heads/master" ]]; then
  echo "PRD Release must be invoked from master; received: $WORKFLOW_REF" >&2
  exit 1
fi

if [[ ! "$CANDIDATE_REF" =~ ^release/homelab/([0-9]{8})$ ]]; then
  echo "Expected release/homelab/YYYYMMDD; received: $CANDIDATE_REF" >&2
  exit 1
fi
release_tag="${BASH_REMATCH[1]}"
parsed_date="$(date -u -d "$release_tag" +%Y%m%d)"
if [[ "$parsed_date" != "$release_tag" ]]; then
  echo "Release branch suffix is not a valid calendar date: $release_tag" >&2
  exit 1
fi

resolved_sha="$(gh api "repos/$GH_REPOSITORY/git/ref/heads/$CANDIDATE_REF" --jq .object.sha)"
if [[ ! "$resolved_sha" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Could not resolve a full commit SHA for $CANDIDATE_REF: $resolved_sha" >&2
  exit 1
fi
if gh api "repos/$GH_REPOSITORY/git/ref/tags/$release_tag" >/dev/null 2>&1; then
  echo "Stable release tag $release_tag already exists." >&2
  exit 1
fi
if gh release view "$release_tag" --repo "$GH_REPOSITORY" >/dev/null 2>&1; then
  echo "GitHub Release $release_tag is already published." >&2
  exit 1
fi

comparison_status="$(gh api "repos/$GH_REPOSITORY/compare/master...$resolved_sha" --jq .status)"
if [[ "$comparison_status" != "ahead" && "$comparison_status" != "identical" ]]; then
  echo "Candidate $CANDIDATE_REF is not based on the current master tip (compare status: $comparison_status)." >&2
  exit 1
fi

{
  echo "release_tag=$release_tag"
  echo "source_ref=$CANDIDATE_REF"
  echo "source_sha=$resolved_sha"
} >> "$GITHUB_OUTPUT"

{
  echo '## 🔎 Release candidate accepted'
  echo
  echo "- Source: $CANDIDATE_REF (branch)"
  echo "- Resolved commit: $resolved_sha"
  echo "- Planned stable release tag: $release_tag"
  echo "- Relationship to current master: $comparison_status"
} >> "$GITHUB_STEP_SUMMARY"
