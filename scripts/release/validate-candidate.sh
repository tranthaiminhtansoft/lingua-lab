#!/usr/bin/env bash
set -euo pipefail

if [[ "$WORKFLOW_REF" != "refs/heads/master" ]]; then
  echo "PRD Release must be invoked from master; received: $WORKFLOW_REF" >&2
  exit 1
fi

if [[ ! "$CANDIDATE_REF" =~ ^refs/heads/release/homelab/([0-9]{8})$ ]]; then
  echo "Expected refs/heads/release/homelab/YYYYMMDD; received: $CANDIDATE_REF" >&2
  exit 1
fi
release_tag="$(basename "$CANDIDATE_REF")"
parsed_date="$(date -u -d "$release_tag" +%Y%m%d)"
if [[ "$parsed_date" != "$release_tag" ]]; then
  echo "Release branch suffix is not a valid calendar date: $release_tag" >&2
  exit 1
fi

if [[ ! "$CANDIDATE_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Candidate SHA must be a full 40-character commit SHA.' >&2
  exit 1
fi
if [[ ! "$SOURCE_CREATOR_RUN_ID" =~ ^[0-9]+$ ]]; then
  echo 'A valid Create PRD Release Branch run ID is required.' >&2
  exit 1
fi

source_run_json="$RUNNER_TEMP/release-branch-creator-run.json"
gh api "repos/$GH_REPOSITORY/actions/runs/$SOURCE_CREATOR_RUN_ID" > "$source_run_json"
source_workflow_event="$(jq -r '.event // empty' "$source_run_json")"
source_workflow_branch="$(jq -r '.head_branch // empty' "$source_run_json")"
source_workflow_path="$(jq -r '.path // empty' "$source_run_json" | cut -d'@' -f1)"
if [[ "$source_workflow_event" != "workflow_dispatch" ||
      "$source_workflow_branch" != "master" ||
      "$source_workflow_path" != ".github/workflows/prd-create-release-branch.yml" ]]; then
  echo 'The source run is not a release branch creation workflow run on master.' >&2
  exit 1
fi
source_guard_success="$(
  gh api "repos/$GH_REPOSITORY/actions/runs/$SOURCE_CREATOR_RUN_ID/jobs" --jq '[.jobs[] | select((.name | contains("Create release branch from master")) and .conclusion == "success")] | length'
)"
if [[ "$source_guard_success" != "1" ]]; then
  echo 'The release branch creation job did not complete successfully.' >&2
  exit 1
fi

ref_name="$(printf '%s' "$CANDIDATE_REF" | sed 's#^refs/heads/##')"
resolved_sha="$(gh api "repos/$GH_REPOSITORY/git/ref/heads/$ref_name" --jq .object.sha)"
if gh api "repos/$GH_REPOSITORY/git/ref/tags/$release_tag" >/dev/null 2>&1; then
  echo "Stable release tag $release_tag already exists." >&2
  exit 1
fi
if [[ "$resolved_sha" != "$CANDIDATE_SHA" ]]; then
  echo "Candidate ref moved after the create event: expected $CANDIDATE_SHA, now resolves to $resolved_sha." >&2
  exit 1
fi
if gh release view "$release_tag" --repo "$GH_REPOSITORY" >/dev/null 2>&1; then
  echo "GitHub Release $release_tag is already published." >&2
  exit 1
fi

comparison_status="$(gh api "repos/$GH_REPOSITORY/compare/master...$CANDIDATE_SHA" --jq .status)"
if [[ "$comparison_status" != "ahead" && "$comparison_status" != "identical" ]]; then
  echo "Candidate $CANDIDATE_SHA is not based on the current master tip (compare status: $comparison_status)." >&2
  exit 1
fi

{
  echo "release_tag=$release_tag"
  echo "source_ref=$CANDIDATE_REF"
  echo "source_sha=$CANDIDATE_SHA"
  echo "source_creator_run_id=$SOURCE_CREATOR_RUN_ID"
} >> "$GITHUB_OUTPUT"

{
  echo '## 🔎 Release candidate accepted'
  echo
  echo "- Source: $CANDIDATE_REF (branch)"
  echo "- Commit: $CANDIDATE_SHA"
  echo "- Planned stable release tag: $release_tag"
  echo "- Branch creator run: #$SOURCE_CREATOR_RUN_ID (https://github.com/$GH_REPOSITORY/actions/runs/$SOURCE_CREATOR_RUN_ID)"
} >> "$GITHUB_STEP_SUMMARY"
