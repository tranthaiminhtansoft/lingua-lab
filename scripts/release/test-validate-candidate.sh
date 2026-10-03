#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
mkdir -p "$tmp/bin"
cat > "$tmp/bin/gh" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$GH_CALL_LOG"
case "$1 $2" in
  "api repos/example/repo/git/ref/heads/release/homelab/20260928") printf '%s\n' "$CANDIDATE_SHA" ;;
  "api repos/example/repo/git/ref/heads/master") printf '%s\n' "$MASTER_SHA" ;;
  "api repos/example/repo/git/ref/tags/20260928") [[ "${EXISTING_TAG:-0}" == 1 ]] ;;
  "release view") [[ "${EXISTING_RELEASE:-0}" == 1 ]] ;;
  *) echo "unexpected gh invocation: $*" >&2; exit 90 ;;
esac
MOCK
cat > "$tmp/bin/date" <<'MOCK'
#!/usr/bin/env python3
import datetime, sys
value = sys.argv[sys.argv.index("-d") + 1]
try:
    parsed = datetime.datetime.strptime(value, "%Y%m%d")
    print(parsed.strftime("%Y%m%d"))
except ValueError:
    sys.exit(1)
MOCK
chmod +x "$tmp/bin/gh" "$tmp/bin/date"
export PATH="$tmp/bin:$PATH" GH_REPOSITORY=example/repo WORKFLOW_REF=refs/heads/master
export CANDIDATE_REF=release/homelab/20260928 CANDIDATE_SHA=0123456789abcdef0123456789abcdef01234567
export MASTER_SHA="$CANDIDATE_SHA"
export GITHUB_OUTPUT="$tmp/output" GITHUB_STEP_SUMMARY="$tmp/summary" GH_CALL_LOG="$tmp/gh.log"
run_valid() {
  : > "$GH_CALL_LOG"; : > "$GITHUB_OUTPUT"; : > "$GITHUB_STEP_SUMMARY"
  bash "$script_dir/validate-candidate.sh"
}
run_valid
 grep -q "source_sha=$CANDIDATE_SHA" "$GITHUB_OUTPUT"
 grep -q "Resolved commit: $CANDIDATE_SHA" "$GITHUB_STEP_SUMMARY"
 grep -q "Candidate exactly matches protected master tip: $CANDIDATE_SHA" "$GITHUB_STEP_SUMMARY"
grep -q 'release build will validate this pinned SHA' "$GITHUB_STEP_SUMMARY"
grep -q 'heads/master' "$GH_CALL_LOG"
MASTER_SHA=ffffffffffffffffffffffffffffffffffffffff; export MASTER_SHA
if run_valid >/dev/null 2>&1; then echo 'unexpectedly accepted candidate that differs from master' >&2; exit 1; fi
for bad_ref in release/homelab/2026092x release/homelab/20260230; do
  CANDIDATE_REF="$bad_ref"; export CANDIDATE_REF
  if bash "$script_dir/validate-candidate.sh" >/dev/null 2>&1; then echo "unexpectedly accepted $bad_ref" >&2; exit 1; fi
done
CANDIDATE_REF=release/homelab/20260928; export CANDIDATE_REF
EXISTING_TAG=1; export EXISTING_TAG
if run_valid >/dev/null 2>&1; then echo 'unexpectedly accepted existing tag' >&2; exit 1; fi
unset EXISTING_TAG
EXISTING_RELEASE=1; export EXISTING_RELEASE
if run_valid >/dev/null 2>&1; then echo 'unexpectedly accepted existing release' >&2; exit 1; fi
printf '%s\n' 'validate-candidate regression checks passed (exact master SHA enforced; malformed ref/date and duplicate tag/release rejected).'
