# Release and rollback policy

## Current `PRD Release` state

`PRD Release` is a manual-only GitHub Actions workflow: its only trigger is `workflow_dispatch`. It has no push, pull-request, schedule, or automatic merge trigger. The repository owner treats an authorized manual dispatch as release approval. Before dispatch, the operator must manually verify an independent human approval on the PR and successful CI for that PR. These are procedural preconditions only: GitHub does not enforce them as release checks, and dispatch itself does not attest that they were met.

The workflow does not contain a machine-enforced readiness gate. Once manually dispatched, it checks out `refs/heads/master` and runs the production build, Pages deployment, and published-route verification jobs below. A successful workflow run is not evidence that the operator completed the independent-review and green-CI preconditions.

The workflow jobs are:

- `Build production artifact` checks out the trusted `refs/heads/master` revision, uses Node.js 22, runs `npm ci` and `npm run build`, then uploads `dist` as the GitHub Pages artifact.
- `Deploy GitHub Pages` deploys that Pages artifact through the `github-pages` environment with the workflow's Pages and OIDC permissions.
- `Verify published Pages routes` uses the deployment URL emitted by the deploy job and Chromium to verify the `/nihongo-o-benkyuo/kana` deep link through the Pages fallback.

Job definitions are not evidence that an artifact has been built, a Pages site has been deployed, or post-deployment verification has passed.

## Operator-verified preconditions

Before each manual dispatch, the operator is responsible for checking that the PR has an independent human approval and successful PR CI. These checks are not enforced by this workflow or GitHub repository settings; do not infer their completion from dispatch eligibility or workflow success. The workflow never merges a pull request automatically.

GitHub Pages uses the repository project path `/lingua-lab/`. Asset paths and router configuration must be verified against that base path as part of the enabled deployment verification.

## Bounded recovery

Recovery must never force-push or reset history. The future `PRD Rollback` workflow is approval-gated and fail-closed. It may create exactly one non-force, PAT-authenticated revert commit only **after** a retained known-good artifact is redeployed and that recovery deployment passes verification. Otherwise it must preserve evidence and stop for manual intervention.

No issue text, actor, commit message, workflow conclusion, or artifact name alone authorizes a rollback. Missing approval, stale `master`, absent or mismatched evidence, a recovery verification failure, or a push conflict is a `MANUAL_STOP`; no automatic retry, reset, force-push, or second revert is permitted.

Secrets are never committed. The future fine-grained rollback PAT is represented in documentation only as `[REDACTED]` and must be exposed exclusively to the final protected-environment revert job.
