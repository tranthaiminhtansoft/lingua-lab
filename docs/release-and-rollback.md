# Release and rollback policy

## Current `PRD Release` state

`PRD Release` is a manual-only GitHub Actions workflow: its only trigger is `workflow_dispatch`. It has no push, pull-request, schedule, or automatic merge trigger. Starting the workflow manually does not currently authorize or perform a production deployment.

The first job, `Release readiness gate`, is intentionally fail-closed. Its only step reports that required current-head checks and reviewer evidence are not yet enforced by a release gate, then exits with status 1. Consequently, `Build production artifact` cannot run; `Deploy GitHub Pages` cannot run; and `Verify published Pages routes` cannot run. There is no live GitHub Pages deployment or deployment verification from this workflow in its current state.

The downstream jobs are deliberately dormant behind that gate. If and only if the readiness gate is later implemented and passes:

- `Build production artifact` checks out the trusted `refs/heads/master` revision, uses Node.js 22, runs `npm ci` and `npm run build`, then uploads `dist` as the GitHub Pages artifact.
- `Deploy GitHub Pages` deploys that Pages artifact through the `github-pages` environment with the workflow's Pages and OIDC permissions.
- `Verify published Pages routes` uses the deployment URL emitted by the deploy job and Chromium to verify the `/nihongo-o-benkyuo/kana` deep link through the Pages fallback.

These job definitions describe future enabled behavior; they are not evidence that an artifact has been built, a Pages site has been deployed, or post-deployment verification has passed.

## Required enablement before deployment can run

A human must approve a change to replace the intentional failing readiness step. Before that change is approved and implemented, manually dispatching `PRD Release` will always stop at `Release readiness gate`.

The platform owner must configure and verify a trusted release-readiness mechanism that evaluates the required checks and the required reviewer profiles against the exact current pull-request head. The platform owner must also configure and read back the repository's GitHub Pages/Actions and `github-pages` environment settings, including any required environment protections and approvals, so that the configured deployment action can receive its required permissions.

After that gate is implemented and the platform configuration is verified, humans must obtain the required current-head check and review evidence, resolve actionable review threads, and approve the final merge to `master`. Only then may an authorized human manually dispatch `PRD Release`; the workflow must still pass its implemented readiness gate before any build, deploy, or verification job can start. The workflow never merges a pull request automatically.

GitHub Pages uses the repository project path `/lingua-lab/`. Asset paths and router configuration must be verified against that base path as part of the enabled deployment verification.

## Bounded recovery

Recovery must never force-push or reset history. The future `PRD Rollback` workflow is approval-gated and fail-closed. It may create exactly one non-force, PAT-authenticated revert commit only **after** a retained known-good artifact is redeployed and that recovery deployment passes verification. Otherwise it must preserve evidence and stop for manual intervention.

No issue text, actor, commit message, workflow conclusion, or artifact name alone authorizes a rollback. Missing approval, stale `master`, absent or mismatched evidence, a recovery verification failure, or a push conflict is a `MANUAL_STOP`; no automatic retry, reset, force-push, or second revert is permitted.

Secrets are never committed. The future fine-grained rollback PAT is represented in documentation only as `[REDACTED]` and must be exposed exclusively to the final protected-environment revert job.
