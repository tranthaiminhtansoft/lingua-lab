# CI/CD and release operations

## Pull-request CI

`.github/workflows/ci.yml` runs on pull requests targeting `master` and pushes to `master`. It validates repository policy and runs lint, typecheck, unit tests, a GitHub Pages-base-path build, and Playwright browser checks in Chromium, Firefox, and WebKit. The master push run provides checks attached to the exact protected master commit consumed by release validation. Run equivalent checks locally with the commands in [current state and local operation](current-state.md). This document describes configured checks; it does not claim that a particular revision passed them.

## Release branch and PRD Release

Run `.github/workflows/prd-create-release-branch.yml` manually from `master`; it takes no inputs. Its job-level `if` is a workflow guard, not evidence of GitHub-enforced protection of the dispatch ref. The workflow retains `contents: write` to create `release/homelab/YYYYMMDD` from the current `master` commit using the Asia/Ho_Chi_Minh date, then dispatches `.github/workflows/prd-release.yml` as a separate workflow run. The repository's dispatch-ref trust boundary remains unresolved by this YAML; do not treat the guard or permission choice as a GitHub-enforced ref restriction.

`PRD Release` is a separate `workflow_dispatch` workflow with one input: `candidate_ref`, the release branch name. Its validation job has an `if: github.ref == 'refs/heads/master'` guard; this guard is part of workflow YAML, not an independent GitHub restriction on the selected dispatch ref. It validates the branch pattern/date and requires its resolved commit to exactly equal the protected `master` tip, with the two named CI contexts successful on that exact SHA. It pins that commit for the build. It then waits for the first `prod` approval and calls the reusable `.github/workflows/wc-release-pages.yml` workflow to deploy the Pages artifact. A verifier checked out from the trusted workflow revision checks the deployed `release-identity.json` against the candidate SHA and checks the homepage, Kana, Grammar, and Vocabulary routes. A verification failure after successful deployment dispatches rollback to the latest stable release. A passing verification waits for a second `prod` approval before publishing the dated stable GitHub Release and its rollback archive/checksum.

## PRD Rollback

`.github/workflows/prd-rollback.yml` supports automatic dispatch after a failed post-deployment verification and manual `workflow_dispatch`. Its only input is `release_version`. It resolves that published stable release, verifies the retained archive and checksum, and summarizes the selected target before the `prod` approval. After approval, it calls the same `wc-release-pages.yml` deploy workflow, then uses the trusted verifier to check the restored identity and route matrix. The summary reports `Rollback verified` only after the checks pass; otherwise it reports unverified recovery and requests manual intervention.

## Production operation serialization

`PRD Release` and `PRD Rollback` use the same workflow-level concurrency group, `lingua-lab-production`, with `queue: max` and no `cancel-in-progress`. Workflow-level scope holds the group for each entire workflow run, including time waiting at production approval gates and post-deployment verification. Only one run in this group proceeds at a time; subsequent runs wait instead of replacing an already-pending run. GitHub permits up to 100 pending runs in a concurrency group; when that limit is full, additional runs are canceled rather than queued. Queue order is based on when a run begins waiting on the group, and is not guaranteed to match dispatch-time order. This is GitHub Actions concurrency serialization, not a separate durable queue.

## GitHub Environments

The `prod` environment is used for the release-deploy, stable-publication, and rollback approval gates. As of 2026-09-27, it requires approval from `tranthaiminhtansoft` and only allows `master`. Self-review is allowed. The approval-only jobs set `deployment: false`: GitHub still applies required reviewers, wait timers, and branch policies, but does not create a GitHub Deployment record for the gate. Custom deployment protection rules are incompatible with this option ([GitHub environment deployment settings](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments#using-environments-without-deployments)).

The reusable deploy workflow uses the `github-pages` environment and attaches the deployment URL from `actions/deploy-pages`, following GitHub's [custom Pages workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages#deploying-github-pages-artifacts). As of 2026-09-27, GitHub has a custom branch policy allowing only `master` on `github-pages`, matching both workflows' dispatch ref. The environment settings were read back from GitHub; workflow YAML alone would not establish that these protections were active.

GitHub Pages uses the project path `/lingua-lab/`. Keep the production build and deep-link verification aware of that base path. See [application architecture](architecture.md) for release trust boundaries and controls that are not established by workflow configuration alone.
