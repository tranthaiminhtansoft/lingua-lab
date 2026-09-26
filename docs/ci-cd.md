# CI/CD and release operations

## Pull-request CI

`.github/workflows/ci.yml` runs on pull requests targeting `master`, subject to a path filter. It currently watches application and test source, public assets, package/configuration files, repository scripts, GitHub workflows and policy configuration, plus `docs/release-and-rollback.md`. The general documentation files (including this page, `docs/README.md`, `docs/current-state.md`, and `docs/architecture.md`) do not currently trigger application CI on their own.

The workflow grants read-only repository contents permission and runs two jobs on Ubuntu 24.04:

1. **Repository policy baseline** runs `node scripts/verify-repo-policy.mjs` to validate the required reviewer-profile configuration shape.
2. **Application validation** installs the locked dependencies on Node.js 22, then runs lint, typecheck, unit tests, a GitHub Pages-base-path build, and Playwright browser checks in Chromium, Firefox, and WebKit.

Run equivalent checks locally with the commands in [current-state and local operation](current-state.md). Actual PR check results are reported by GitHub for each commit; this document describes the configured workflow, not a claim that every revision has passed.

## Production release

`.github/workflows/prd-release.yml` has only a manual `workflow_dispatch` trigger. Its first job, **Release readiness gate**, intentionally exits with status 1 because current-head checks and reviewer evidence are not yet enforced by an implemented gate. The build, GitHub Pages deployment, and deployed-route verification jobs therefore remain dormant. Dispatching the workflow does not publish the site.

The repository policy script confirms the required profile names but the identity mapping is intentionally empty. A human/platform owner must implement and verify the trusted readiness and GitHub Pages/environment configuration before a release can be enabled. The full prerequisites and safety rules are in [release-and-rollback policy](release-and-rollback.md).

## Rollback workflow

`.github/workflows/prd-rollback.yml` currently runs a read-only bootstrap check when a `PRD Release` workflow run completes on `master`. It records that rollback schemas, retained artifacts, approval environment, recovery ledger, and PAT policy are not configured. It performs no artifact download, deployment, secret access, retry, revert, or repository mutation. It is not an operational rollback mechanism yet.

## GitHub Pages path contract

The production build uses the `/lingua-lab/` project path. The release workflow's future verification job targets `/nihongo-o-benkyuo/kana` through the Pages fallback. Keep router and asset paths base-aware, and do not interpret the configured target URL as proof of a live deployment.
