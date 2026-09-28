# Release and rollback policy

## Branch and tag policy

Run the `Create PRD Release Branch` workflow from `master`; it has no inputs and uses the current date in the Asia/Ho_Chi_Minh timezone as `YYYYMMDD`. It creates `release/homelab/YYYYMMDD` at the current `master` commit, then dispatches the separate `PRD Release` workflow with one input: that branch name. `PRD Release` is a `workflow_dispatch` workflow whose trusted definition runs from `master`; it only accepts a branch matching `release/homelab/YYYYMMDD`.

A stable GitHub Release is created only after deployment verification succeeds and the final `prod` approval passes. Its tag uses the same `YYYYMMDD` suffix as the release branch. The release includes the exact deployable site archive and its SHA-256 checksum for rollback.

## PRD Release

The branch creator validates the date, rejects an existing branch, tag, or GitHub Release for that date, and cuts the branch from `master`. It then dispatches the release workflow as a separate run. `PRD Release` validates the branch pattern and calendar date, resolves the branch commit internally, and checks that it is based on the current `master`. It runs these checks against the pinned commit:

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit -- --run`
- `npm run test:e2e` against the configured GitHub Pages base path, using Chromium, Firefox, and WebKit
- `npm run build` and packaging of the Pages output for later rollback

The first `prod` approval authorizes production deployment. The Pages artifact is deployed through the reusable `wc-release-pages.yml` workflow, which is shared with rollback and uses the `github-pages` environment. Post-deployment verification checks that the published homepage responds successfully and that `/nihongo-o-benkyuo/kana` loads through the Pages fallback, displays a `Kana` level-one heading, and preserves the deep-link path.

If post-deployment verification fails after the Pages deployment succeeds, `PRD Release` dispatches `PRD Rollback` on `master`. It does not publish the failed candidate as a GitHub Release. If verification succeeds, the second `prod` approval authorizes publishing the stable GitHub Release and its `YYYYMMDD` tag. The release summary is written to the GitHub Actions run; no external notification service is used.

## PRD Rollback

`PRD Rollback` supports automatic dispatch after a failed production verification and manual `workflow_dispatch`. Its only input is `release_version`, a published stable `YYYYMMDD` release tag. After verification fails, `PRD Release` selects GitHub’s latest published stable release and passes its tag as `release_version`.

Before approval, the workflow resolves the requested release date and commit, checks that the release is published and not a prerelease, downloads the retained site archive, verifies its SHA-256 checksum, and confirms the extracted site has a root `index.html`. The rollback run summary displays the chosen target and artifact status; the failed candidate remains in the PRD Release run summary.

After the `prod` approval, the workflow uses the same reusable `wc-release-pages.yml` workflow to redeploy the retained Pages artifact. It does not run application or browser verification after rollback; the Actions summary records the deploy action result and target release. If there is no stable release or the asset/checksum is missing or invalid, the workflow stops without deploying.

Rollback only changes the deployed Pages artifact. It does not create a revert commit, modify branches, reset history, force-push, or use a PAT.

## Workflow implementation

The workflow files keep job ordering, approvals, environments, permissions, and artifact handoffs. Multi-step release operations live under `scripts/release/`; production browser checks use a Node script so Playwright logic stays out of YAML. The Node setup and dependency installation steps are shared through the local composite action.

## GitHub environment configuration

As of 2026-09-27, the repository has a `prod` environment with `tranthaiminhtansoft` as a required reviewer and a custom branch rule allowing only `master`. Self-review is allowed, so this gate pauses for an explicit approval but permits the same account to approve a run it initiated. The approval-only jobs set `deployment: false`, which still applies required reviewers, wait timers, and branch policies while suppressing GitHub Deployment records. GitHub custom deployment protection rules are incompatible with this setting, so use required reviewers and branch policies for `prod` ([GitHub environment deployment settings](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments#using-environments-without-deployments)). The actual deploy job uses `github-pages` with the deployment URL from `actions/deploy-pages`, matching [GitHub Pages deployment guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts). GitHub also has a custom `master` branch policy on `github-pages`. Configure repository branch protection separately to control who can start release runs and create `release/homelab/*` branches. Run `Create PRD Release Branch` from the `master` ref. These settings were read back from GitHub; recheck them if repository settings change.

GitHub Pages uses the project base path `/lingua-lab/`; build and deep-link verification must continue to cover that base path.
