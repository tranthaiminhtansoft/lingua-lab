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

master_sha="$(gh api "repos/$GH_REPOSITORY/git/ref/heads/master" --jq .object.sha)"
if [[ ! "$master_sha" =~ ^[0-9a-f]{40}$ || "$resolved_sha" != "$master_sha" ]]; then
  echo "Candidate $CANDIDATE_REF must exactly match the protected master tip (candidate: $resolved_sha; master: ${master_sha:-unresolved})." >&2
  exit 1
fi

{
  echo "release_tag=$release_tag"
  echo "source_ref=$CANDIDATE_REF"
  echo "source_sha=$resolved_sha"
} >> "$GITHUB_OUTPUT"

{
  echo '## 🔎 Release candidate accepted after eligibility checks'
  echo
  echo "- Source: $CANDIDATE_REF (branch)"
  echo "- Resolved commit: $resolved_sha"
  echo "- Planned stable release tag: $release_tag"
  echo "- Candidate exactly matches protected master tip: $master_sha"
  echo '- The release build will validate this pinned SHA before deployment.'
} >> "$GITHUB_STEP_SUMMARY"
