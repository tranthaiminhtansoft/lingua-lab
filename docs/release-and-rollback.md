# Release and rollback policy

## Release

A production release is eligible only after the pull request's **current head** has passed its required checks and has public review evidence from the required reviewer profiles. A workflow never merges a pull request automatically; the user performs the final merge unless they authorize it explicitly in the same session.

`PRD Release` is limited to pushes to `master`. It must build and deploy a single immutable artifact through GitHub Pages Actions after the static application exists. The current repository bootstrap has no deployable application, so its release preflight intentionally makes no deployment.

GitHub Pages uses the repository project path `/lingua-lab/`. Application asset paths and router configuration must be verified against that base path before release.

## Bounded recovery

Recovery must never force-push or reset history. The future `PRD Rollback` workflow is approval-gated and fail-closed. It may create exactly one non-force, PAT-authenticated revert commit only **after** a retained known-good artifact is redeployed and that recovery deployment passes verification. Otherwise it must preserve evidence and stop for manual intervention.

No issue text, actor, commit message, workflow conclusion, or artifact name alone authorizes a rollback. Missing approval, stale `master`, absent or mismatched evidence, a recovery verification failure, or a push conflict is a `MANUAL_STOP`; no automatic retry, reset, force-push, or second revert is permitted.

Secrets are never committed. The future fine-grained rollback PAT is represented in documentation only as `[REDACTED]` and must be exposed exclusively to the final protected-environment revert job.
