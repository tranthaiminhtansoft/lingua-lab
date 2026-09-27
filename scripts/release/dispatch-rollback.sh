#!/usr/bin/env bash
set -euo pipefail

if ! rollback_version="$(gh api "repos/$GH_REPOSITORY/releases/latest" --jq .tag_name)"; then
  echo 'No previous stable GitHub Release is available; automatic rollback cannot select a target.' >&2
  echo 'No previous stable release was available for automatic rollback.' >> "$GITHUB_STEP_SUMMARY"
  exit 1
fi
if [[ ! "$rollback_version" =~ ^[0-9]{8}$ ]]; then
  echo "Latest stable release has an unsupported YYYYMMDD version: $rollback_version" >&2
  echo "Latest stable release could not be used for automatic rollback: $rollback_version" >> "$GITHUB_STEP_SUMMARY"
  exit 1
fi

gh workflow run prd-rollback.yml --repo "$GH_REPOSITORY" --ref master -f release_version="$rollback_version"

{
  echo '## ↩️ Automatic rollback requested'
  echo
  echo "- Failed candidate: $CANDIDATE_VERSION"
  echo "- Candidate ref: $CANDIDATE_REF"
  echo "- Candidate commit: $CANDIDATE_SHA"
  echo "- Rollback target: $rollback_version"
  echo 'PRD Rollback will validate this release artifact, then wait for the prod approval gate.'
} >> "$GITHUB_STEP_SUMMARY"
