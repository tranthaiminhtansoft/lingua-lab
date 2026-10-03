#!/usr/bin/env bash
set -euo pipefail

summary_failure() {
  {
    printf '## ❌ Rollback stopped: %s\n\n' "$1"
    printf '%s\n' "$2"
  } >> "$GITHUB_STEP_SUMMARY"
}

if [[ "${GITHUB_REF:-}" != "refs/heads/master" ]]; then
  summary_failure 'workflow must run from master' "Received ${GITHUB_REF:-missing}. Start PRD Rollback from master. No rollback was deployed."
  exit 1
fi

mkdir -p "$ASSET_DIR" "$SITE_DIR"

valid_date_tag() {
  local parsed_date
  [[ "$1" =~ ^[0-9]{8}$ ]] || return 1
  parsed_date="$(date -u -d "$1" +%Y%m%d 2>/dev/null)" || return 1
  [[ "$parsed_date" == "$1" ]]
}

if ! valid_date_tag "$RELEASE_VERSION"; then
  summary_failure 'invalid release version' 'The selected stable release version must be a valid YYYYMMDD date. No rollback was deployed.'
  exit 1
fi

release_json="$RUNNER_TEMP/rollback-release.json"
if ! gh api "repos/${GH_REPOSITORY}/releases/tags/${RELEASE_VERSION}" > "$release_json"; then
  summary_failure 'requested release not found' "No published GitHub Release exists for date ${RELEASE_VERSION}. No rollback was deployed."
  exit 1
fi

release_tag="$(jq -r '.tag_name // empty' "$release_json")"
release_url="$(jq -r '.html_url // empty' "$release_json")"
is_draft="$(jq -r '.draft' "$release_json")"
is_prerelease="$(jq -r '.prerelease' "$release_json")"

if ! valid_date_tag "$release_tag" || [[ "$is_draft" != "false" || "$is_prerelease" != "false" ]]; then
  summary_failure 'target is not a published stable date release' "Resolved tag: ${release_tag:-missing}; draft: ${is_draft:-unknown}; prerelease: ${is_prerelease:-unknown}. No rollback was deployed."
  exit 1
fi
if [[ "$release_tag" != "$RELEASE_VERSION" ]]; then
  summary_failure 'resolved release tag does not match requested version' "Requested release: $RELEASE_VERSION; resolved tag: ${release_tag:-missing}. No rollback was deployed."
  exit 1
fi

if ! jq -e '.assets | map(.name) | contains(["site-dist.tar.gz", "site-dist.tar.gz.sha256"])' "$release_json" >/dev/null; then
  summary_failure 'stable release asset is missing' "Release ${release_tag} does not contain both the deployable site archive and its checksum. No rollback was deployed."
  exit 1
fi

if ! release_sha="$(gh api "repos/${GH_REPOSITORY}/commits/${release_tag}" --jq .sha)"; then
  summary_failure 'release commit could not be resolved' "Could not resolve the commit for stable release ${release_tag}. No rollback was deployed."
  exit 1
fi

if ! gh release download "$release_tag" --dir "$ASSET_DIR" --repo "$GH_REPOSITORY"; then
  summary_failure 'release assets could not be downloaded' "Could not download the retained artifact for ${release_tag}. No rollback was deployed."
  exit 1
fi

if ! (cd "$ASSET_DIR" && sha256sum --check site-dist.tar.gz.sha256); then
  summary_failure 'release artifact checksum failed' "The retained artifact for ${release_tag} did not match its checksum. No rollback was deployed."
  exit 1
fi

if ! tar -xzf "$ASSET_DIR/site-dist.tar.gz" -C "$SITE_DIR"; then
  summary_failure 'release artifact could not be extracted' "The retained artifact for ${release_tag} could not be extracted. No rollback was deployed."
  exit 1
fi
if [[ ! -f "$SITE_DIR/index.html" ]]; then
  summary_failure 'release artifact is invalid' "The extracted artifact for ${release_tag} has no root index.html. No rollback was deployed."
  exit 1
fi

{
  echo "release_tag=$release_tag"
  echo "release_url=$release_url"
  echo "release_sha=$release_sha"
} >> "$GITHUB_OUTPUT"

{
  echo '## 🔎 Rollback target selected'
  echo
  echo "- Stable release: [${release_tag}](${release_url})"
  echo "- Release commit: ${release_sha}"
  echo '- Retained site artifact: present and checksum verified'
  echo "- Release version requested: $RELEASE_VERSION"
  echo
  echo 'The workflow is waiting for the `prod` approval before deploying this release.'
} >> "$GITHUB_STEP_SUMMARY"
