#!/usr/bin/env bash
set -euo pipefail

if [[ ! "$RELEASE_TAG" =~ ^[0-9]{8}$ ]]; then
  echo "Expected a YYYYMMDD release tag; received: $RELEASE_TAG" >&2
  exit 1
fi
if [[ ! "$SOURCE_SHA" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Expected a full 40-character source commit SHA.' >&2
  exit 1
fi
if [[ ! -s release-assets/site-dist.tar.gz || ! -s release-assets/site-dist.tar.gz.sha256 ]]; then
  echo 'The rollback archive and checksum must both be present before publishing.' >&2
  exit 1
fi

notes_file="$RUNNER_TEMP/release-notes.md"
cat > "$notes_file" <<EOF
Stable production release for ${RELEASE_TAG}.

- Source: ${SOURCE_REF}
- Commit: ${SOURCE_SHA}
- Production route verification: passed
EOF

gh release create "$RELEASE_TAG" \
  release-assets/site-dist.tar.gz \
  release-assets/site-dist.tar.gz.sha256 \
  --target "$SOURCE_SHA" \
  --title "Lingua Lab ${RELEASE_TAG}" \
  --notes-file "$notes_file" \
  --latest \
  --repo "$GH_REPOSITORY"

release_url="$(gh release view "$RELEASE_TAG" --repo "$GH_REPOSITORY" --json url --jq .url)"
if [[ -z "$release_url" ]]; then
  echo "GitHub Release ${RELEASE_TAG} was created, but its URL could not be resolved." >&2
  exit 1
fi
echo "release_url=$release_url" >> "$GITHUB_OUTPUT"

{
  echo '## 🎉 Stable GitHub Release published'
  echo
  echo "- Version: \`$RELEASE_TAG\`"
  echo "- Source: \`$SOURCE_REF\`"
  echo "- Commit: \`$SOURCE_SHA\`"
  echo "- Release: $release_url"
  echo '- Rollback artifact and SHA-256 checksum are attached to this release.'
} >> "$GITHUB_STEP_SUMMARY"
