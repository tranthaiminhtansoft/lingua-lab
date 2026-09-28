# CI/CD and release operations

## Pull-request CI

`.github/workflows/ci.yml` runs on pull requests targeting `master`, subject to a path filter. It validates repository policy and runs lint, typecheck, unit tests, a GitHub Pages-base-path build, and Playwright browser checks in Chromium, Firefox, and WebKit. Run equivalent checks locally with the commands in [current state and local operation](current-state.md). This document describes configured checks; it does not claim that a particular revision passed them.

## Release branch and PRD Release

Run `.github/workflows/prd-create-release-branch.yml` manually from `master`; it takes no inputs. It creates `release/homelab/YYYYMMDD` from the current `master` commit using the Asia/Ho_Chi_Minh date, then dispatches `.github/workflows/prd-release.yml` as a separate workflow run.

`PRD Release` is a separate `workflow_dispatch` workflow with one input: `candidate_ref`, the release branch name. It validates the branch pattern/date and relationship to current `master`, resolves the branch commit, and pins that commit for the build. It then waits for the first `prod` approval and calls the reusable `.github/workflows/wc-release-pages.yml` workflow to deploy the Pages artifact. Production verification checks the homepage response and Kana deep link. A verification failure after successful deployment dispatches rollback to the latest stable release. A passing verification waits for a second `prod` approval before publishing the dated stable GitHub Release and its rollback archive/checksum.

## PRD Rollback

`.github/workflows/prd-rollback.yml` supports automatic dispatch after a failed post-deployment verification and manual `workflow_dispatch`. Its only input is `release_version`. It resolves that published stable release, verifies the retained archive and checksum, and summarizes the selected target before the `prod` approval. After approval, it calls the same `wc-release-pages.yml` deploy workflow. It does not run application verification after rollback.

## GitHub Environments

The `prod` environment is used for the release-deploy, stable-publication, and rollback approval gates. As of 2026-09-27, it requires approval from `tranthaiminhtansoft` and only allows `master`. Self-review is allowed. The approval-only jobs set `deployment: false`: GitHub still applies required reviewers, wait timers, and branch policies, but does not create a GitHub Deployment record for the gate. Custom deployment protection rules are incompatible with this option ([GitHub environment deployment settings](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments#using-environments-without-deployments)).

The reusable deploy workflow uses the `github-pages` environment and attaches the deployment URL from `actions/deploy-pages`, following GitHub's [custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts). As of 2026-09-27, GitHub has a custom branch policy allowing only `master` on `github-pages`, matching both workflows' dispatch ref. The environment settings were read back from GitHub; workflow YAML alone would not establish that these protections were active.

GitHub Pages uses the project path `/lingua-lab/`. Keep the production build and deep-link verification aware of that base path. See [release and rollback policy](release-and-rollback.md) for the detailed flow.
