#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin" "$tmp/fixtures"

# Use the host-independent semantics of date -d YYYYMMDD in the production script.
cat > "$tmp/bin/date" <<'MOCK'
#!/usr/bin/env python3
import datetime, sys
try:
    value = sys.argv[sys.argv.index("-d") + 1]
    print(datetime.datetime.strptime(value, "%Y%m%d").strftime("%Y%m%d"))
except (ValueError, IndexError):
    sys.exit(1)
MOCK

cat > "$tmp/bin/gh" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GH_CALL_LOG"
case "$1 $2" in
  "api repos/example/repo/releases/tags/20260928")
    [[ "${GH_RELEASE_LOOKUP_FAIL:-0}" == 1 ]] && exit 1
    cat "$GH_RELEASE_JSON"
    ;;
  "api repos/example/repo/commits/20260928")
    [[ "${GH_COMMIT_LOOKUP_FAIL:-0}" == 1 ]] && exit 1
    printf '%s\n' 'abcdef0123456789abcdef0123456789abcdef01'
    ;;

  "release download")
    [[ "${GH_DOWNLOAD_FAIL:-0}" == 1 ]] && exit 1
    cp "$ARCHIVE_SOURCE" "$ASSET_DIR/site-dist.tar.gz"
    cp "$CHECKSUM_SOURCE" "$ASSET_DIR/site-dist.tar.gz.sha256"
    ;;
  *) echo "unexpected gh invocation: $*" >&2; exit 90 ;;
esac
MOCK
chmod +x "$tmp/bin/date" "$tmp/bin/gh"
export PATH="$tmp/bin:$PATH" GH_REPOSITORY=example/repo GITHUB_REF=refs/heads/master RELEASE_VERSION=20260928
export RUNNER_TEMP="$tmp/runner" ASSET_DIR="$tmp/assets" SITE_DIR="$tmp/site"
export GITHUB_OUTPUT="$tmp/output" GITHUB_STEP_SUMMARY="$tmp/summary" GH_CALL_LOG="$tmp/gh.log"
export GH_RELEASE_JSON="$tmp/release.json" ARCHIVE_SOURCE="$tmp/fixtures/site-dist.tar.gz"
export CHECKSUM_SOURCE="$tmp/fixtures/site-dist.tar.gz.sha256"
mkdir -p "$RUNNER_TEMP" "$ASSET_DIR"

write_release() {
  local tag="${1:-20260928}" assets="${2:-both}" draft="${3:-false}" prerelease="${4:-false}"
  local entries='[]'
  if [[ "$assets" == both ]]; then
    entries='[{"name":"site-dist.tar.gz"},{"name":"site-dist.tar.gz.sha256"}]'
  elif [[ "$assets" == archive ]]; then
    entries='[{"name":"site-dist.tar.gz"}]'
  fi
  printf '{"tag_name":"%s","html_url":"https://example.test/releases/%s","draft":%s,"prerelease":%s,"assets":%s}\n' "$tag" "$tag" "$draft" "$prerelease" "$entries" > "$GH_RELEASE_JSON"
}
reset_case() {
  rm -rf "$ASSET_DIR" "$SITE_DIR"
  mkdir -p "$ASSET_DIR"
  : > "$GITHUB_OUTPUT"; : > "$GITHUB_STEP_SUMMARY"; : > "$GH_CALL_LOG"
  unset GH_RELEASE_LOOKUP_FAIL GH_COMMIT_LOOKUP_FAIL GH_DOWNLOAD_FAIL
}
run_success() { bash "$script_dir/resolve-rollback-target.sh"; }
expect_failure() {
  local message="$1"
  if run_success >"$tmp/stdout" 2>"$tmp/stderr"; then
    echo "unexpectedly accepted: $message" >&2; exit 1
  fi
  grep -Fq "$message" "$GITHUB_STEP_SUMMARY" || { echo "missing failure summary: $message" >&2; cat "$GITHUB_STEP_SUMMARY" >&2; exit 1; }
  [[ ! -s "$GITHUB_OUTPUT" ]] || { echo "failure wrote deployment outputs: $message" >&2; exit 1; }
  grep -Fq 'No rollback was deployed.' "$GITHUB_STEP_SUMMARY" || { echo 'failure summary did not preserve no-deploy boundary' >&2; exit 1; }
}

# Construct a valid, real archive and matching checksum for successful extraction.
mkdir -p "$tmp/site-source"
printf '%s\n' '<h1>retained release</h1>' > "$tmp/site-source/index.html"
tar -czf "$ARCHIVE_SOURCE" -C "$tmp/site-source" index.html
(cd "$tmp/fixtures" && sha256sum site-dist.tar.gz > site-dist.tar.gz.sha256)

reset_case; write_release; run_success
grep -Fq 'release_tag=20260928' "$GITHUB_OUTPUT"
grep -Fq 'release_sha=abcdef0123456789abcdef0123456789abcdef01' "$GITHUB_OUTPUT"
grep -Fq 'waiting for the `prod` approval' "$GITHUB_STEP_SUMMARY"
[[ -f "$SITE_DIR/index.html" ]]

reset_case; GH_RELEASE_LOOKUP_FAIL=1; export GH_RELEASE_LOOKUP_FAIL
write_release; expect_failure 'requested release not found'

reset_case; write_release 20261001; expect_failure 'resolved release tag does not match requested version'
! grep -Fq 'release download' "$GH_CALL_LOG"

reset_case; write_release 20260928 archive; expect_failure 'stable release asset is missing'
! grep -Fq 'release download' "$GH_CALL_LOG"

reset_case; write_release
printf '%s\n' '0000000000000000000000000000000000000000000000000000000000000000  site-dist.tar.gz' > "$CHECKSUM_SOURCE"
expect_failure 'release artifact checksum failed'

reset_case; write_release
printf '%s\n' 'not a gzip archive' > "$ARCHIVE_SOURCE"
(cd "$tmp/fixtures" && sha256sum site-dist.tar.gz > site-dist.tar.gz.sha256)
expect_failure 'release artifact could not be extracted'

printf '%s\n' 'resolve-rollback-target regression checks passed (valid target; missing release/asset, bad checksum, malformed archive rejected before deployment boundary).'
