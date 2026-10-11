# CI/CD Roadmap

Current state, known gaps, and a prioritized improvement path for Lingua Lab’s GitHub Actions and GitHub Pages delivery. Start with **Current state** and **Next work**; checklist IDs track the detailed work. The project overview is in [ROADMAP.md](ROADMAP.md).

## Current state

| Area | Status | Evidence in the repository |
|---|---|---|
| Pull request validation | **Established** | `ci.yml` runs lint, type check, unit tests, build, and Playwright smoke checks in Chromium, Firefox, and WebKit on Node 22. Dependencies install with `npm ci`. |
| Required PR gate | **Established with a manual review limitation** | `release-gate.yml` checks the current PR head and requires application CI when changed paths match the trusted CI allowlist. Its workflow summary says independent reviewer-profile checks are still an operator-verified release precondition. |
| Production release | **Established** | A manually started workflow creates a dated release branch, validates and pins its commit, gates candidate deployment and stable publication with the `prod` environment, builds one Pages artifact, verifies production, then publishes a stable GitHub Release. |
| Release evidence | **Established** | The release records source identity and a site manifest, retains the site archive and SHA-256 checksum for 30 days, and stores production verification evidence. |
| Recovery | **Established** | A failed post-deploy verification dispatches a rollback workflow. An operator can also request a rollback manually; the workflow validates a retained stable release, requires approval, redeploys it, and verifies the result. |
| Workflow permissions | **Established** | Workflows use read-only defaults or job-level permissions, pin third-party Actions to commit SHAs, and serialize production deploys without cancelling an active deployment. |
| Dependency version policy | **Needs a decision** | `npm ci` uses the committed lockfile, but many direct dependencies in `package.json` use the floating `latest` specifier. Establish how declared versions and lockfile updates stay aligned. |
| Security and repository settings | **Needs live read-back** | The checked-in workflows do not show CodeQL, dependency review, an `npm audit` policy, an SBOM, or artifact provenance attestation. Dependabot, secret scanning, push protection, branch rules, and Environment reviewers are configured outside these files and must be checked in GitHub before their status is called enabled or missing. |

## Next work

### 1. Close CI trigger coverage gaps

The current path-filter regression script explicitly expects workflow-only changes and `scripts/build-docs.mjs` changes to skip application CI. That script is not listed in `package.json` scripts or called from `ci.yml`. Other release/build scripts and configuration files also need an explicit trigger decision. A skipped check should mean the changed files cannot affect the application, build, policy, or production delivery.

Start with `CICD-001`: inventory every file that can affect CI, build output, release validation, deployment, or recovery. Then adjust the trusted allowlist and path-filter tests so workflow and relevant tooling changes receive appropriate validation. Keep unrelated prose-only changes lightweight where safe.

### 2. Validate workflow and release tooling changes

Add static validation for GitHub Actions workflow syntax and shell scripts, and run the existing release-script fixture checks in CI. Make sure the path-filter tests themselves run on the changes they protect. This catches broken workflow expressions and recovery decisions before a production release is started.

### 3. Read back governance and security controls

Inspect the live repository ruleset, required checks, protected `prod` Environment, reviewer identities, Dependabot, secret scanning, and push protection. The current profile reviewer mapping is empty, and the Release Gate explicitly leaves profile review as a manual release precondition. Decide which approvals should remain a human release-owner responsibility and which can be checked against trusted GitHub identity and ruleset data. Add only controls that can fail closed and produce evidence tied to the current commit.

Then select dependency and code security checks appropriate to this small static React/Vite application. Define how dependency advisories are handled, including build-time packages, severity thresholds, and time-limited exceptions. Add SBOM, license inventory, and provenance only with an owner and a clear use in release review or recovery. Align manifest version ranges with the lockfile and use controlled update PRs.

### 4. Improve production confidence and operating feedback

The release verifier currently launches Chromium and validates the deployed build identity, route content, assets, and extended site behavior. PR CI covers three browser engines. Decide whether release-time verification needs the full browser matrix or whether Chromium production checks plus cross-browser PR checks are sufficient. Review production verification failures and recovery runs to find recurring blind spots before adding more checks.

Measure workflow duration and failure causes before adding browser caching or splitting jobs. Add periodic production availability checks only if someone will review and act on their results; GitHub Actions by itself is not a continuous monitoring service.

## Recommended order

1. `CICD-001` and `CICD-002`: fix trigger coverage and test the path-filter policy.
2. `CICD-003`: add workflow syntax, shell, and release-script validation to CI.
3. `CICD-004` and `CICD-005`: read back repository protections and resolve the reviewer identity/manual-precondition gap.
4. `CICD-006` and `CICD-007`: establish dependency/code security and supply-chain evidence policies.
5. `CICD-008` and `CICD-009`: review production verification depth and measure performance/operational feedback.

Do not assign dates until they are agreed. Keep current human approval gates for production; changes to approval or recovery behavior require their own review and validation.

## Checklist

- [ ] `CICD-001` Inventory all application, workflow, build, policy, release, deployment, recovery, and configuration paths; define which require CI and document intentional skips.
- [ ] `CICD-002` Update the trusted CI path allowlist and regression cases so relevant workflow/build/release tooling changes cannot silently bypass validation; keep unrelated documentation-only changes appropriately scoped.
- [ ] `CICD-003` Run path-filter regression tests, workflow syntax validation, shell checks, and release-script fixture tests from CI for the files they cover.
- [ ] `CICD-004` Read back and record the live branch ruleset, exact required check names, current-head behavior, protected production Environment, and deployment concurrency settings.
- [ ] `CICD-005` Configure and verify trusted reviewer identities or explicitly document the durable manual review process; do not present an empty identity map as automated review enforcement.
- [ ] `CICD-006` Read back Dependabot, GitHub Secret Scanning, and Push Protection settings; define dependency version ranges and lockfile update policy, enable appropriate controls, and document verified status.
- [ ] `CICD-007` Define and implement a dependency/code security policy for production and development dependencies, including severity thresholds, exception owner/expiry, and release evidence; decide whether SBOM, license inventory, and signed artifact provenance are required.
- [ ] `CICD-008` Review candidate verification against observed production failures; decide and document the browser matrix, route coverage, asset/build identity checks, and recovery evidence required before stable publication.
- [ ] `CICD-009` Record CI/release durations and failure causes, then make evidence-based performance changes; add periodic availability checks only with a named response owner.
- [ ] `CICD-010` Update release, rollback, and post-release runbooks whenever workflow behavior or approval requirements change; verify recovery fixture coverage for each changed failure path.

> Mark a task complete only when its behavior is implemented and its evidence is available. Repository settings require live read-back; workflow files alone do not prove their state.
