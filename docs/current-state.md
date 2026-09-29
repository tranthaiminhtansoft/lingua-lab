# Current product state and local operation

## Prerequisites and install

Run from the repository root. [`.nvmrc`](../.nvmrc) pins Node.js **22.22.2**; select that version with your Node version manager before installing. [`package.json`](../package.json) does not declare a root `engines` or `packageManager` field. The [npm lockfile](../package-lock.json) is lockfileVersion 3 and records dependencies including jsdom that require Node `^22.22.2 || ^24.15.0 || >=26.0.0`; use the repository pin rather than assuming any Node 22 release will work. npm is required; the repository does not pin an npm version. Check the active runtime with `node --version` and `npm --version`.

```sh
npm ci
```

`npm ci` installs the locked dependency tree and replaces an existing `node_modules` directory. Install Playwright browser binaries separately before E2E runs (see below). Do not treat an install under a different Node version as validation of the pinned runtime.

## Development server and routes

```sh
npm run dev
```

Vite prints the URL to open (normally `http://localhost:5173/`; use the printed URL if the port changes). With `GITHUB_ACTIONS` unset, [`vite.config.ts`](../vite.config.ts) uses `/` as the base. The application routes in [`src/app/router.tsx`](../src/app/router.tsx) include:

| Local path | What to inspect |
| --- | --- |
| `/` | Language home |
| `/nihongo-o-benkyuo` | Nihongo learning path |
| `/nihongo-o-benkyuo/kana` | Kana lesson and practice |
| `/nihongo-o-benkyuo/grammar` | Grammar topics |
| `/nihongo-o-benkyuo/grammar/first-introductions` | First introductions grammar lesson |
| `/nihongo-o-benkyuo/vocabulary` | Vocabulary topics |
| `/nihongo-o-benkyuo/vocabulary/first-introductions` | First introductions vocabulary lesson |
| `/lessons/kana` | Legacy path; redirects to the Kana route |

Open these paths at the dev server origin; do not prefix local dev routes with `/lingua-lab/`. Japanese speech uses browser/device support, so manual audio checks depend on the available voice.

## Local checks

After `npm ci`, run the following from the repository root (stop the dev server or use another terminal):

```sh
npm run lint
npm run typecheck
npm run test:unit -- --run
npm run build
```

`lint` runs ESLint; `typecheck` runs `tsc -b --pretty false`; the unit command runs Vitest once rather than leaving its default watch process running. [`vitest.config.ts`](../vitest.config.ts) uses jsdom and excludes `e2e/**`. `build` runs `tsc -b` then `vite build`, producing `dist/`; it is not a deployment. An exit code of zero only establishes that the invoked check completed successfully in that local environment, not that all product behavior is covered.

### Browser/E2E checks

The repository's [CI workflow](../.github/workflows/ci.yml) uses `npx playwright install --with-deps chromium firefox webkit` to install the three browsers and Linux system dependencies. On macOS, install the same configured browsers without the Linux dependency option:

```sh
npx playwright install chromium firefox webkit
npm run test:e2e
```

Run the E2E command after installing browser binaries. [`playwright.config.ts`](../playwright.config.ts) defines all three browser projects and starts its own web server with `GITHUB_ACTIONS=true npm run build && node e2e/pages-server.mjs`; no separately started preview server is needed. That harness serves `dist/` at `http://127.0.0.1:4176/lingua-lab/`, and [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts) exercises navigation, lessons, narrow screens, and a Kana deep-link refresh. Ensure port 4176 is free: outside CI, Playwright may reuse an existing server at that URL instead of launching a fresh build. Browser installation or OS support may block the run; report that separately from test failures.

### Production build and local preview

For an ordinary local build, `npm run build` uses `/` as its base. After building, preview its assets with the installed Vite CLI (there is no `preview` npm script):

```sh
npm exec -- vite preview
```

Use the URL printed by Vite (normally `http://localhost:4173/`) and the same unprefixed routes as local dev. To inspect the GitHub Pages-style base path instead, build with the config's base-path flag before previewing:

```sh
GITHUB_ACTIONS=true npm run build
GITHUB_ACTIONS=true npm exec -- vite preview
```

The Pages-style build uses `/lingua-lab/`; open the preview URL with that prefix, for example `http://localhost:4173/lingua-lab/`. Do not infer a live Pages deployment from either preview. [`public/404.html`](../public/404.html) implements the Pages deep-link fallback; Vite preview is not a substitute for checking that fallback on Pages. Use the E2E harness for the repository's configured base-path and refresh checks. See [CI/CD](ci-cd.md) for workflow and release details.

## Interpreting results

The commands above are instructions, not claims that they have passed on the current revision. Record the Node/npm versions, command, exit status, and any failing tests or missing browsers when reporting local results. Lint, types, unit tests, build, and E2E cover different risks; one passing check does not imply the others passed. Local builds, previews, and browser checks are **not production deployment verification** or release approval.

## Release and rollback acceptance coverage (PR #4)

This is a **test strategy and source inspection**, not a record of passing release runs. For any PR claim, inspect the current head SHA and its checks; this document does not assert that local worktree changes are present in GitHub or that a release has executed. CI in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) invokes repository policy validation, lint, typecheck, unit tests, Pages-base build and three-browser E2E. [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts) covers local Pages-style navigation and Kana refresh, **not** a live release/rollback or its approval, artifact identity and recovery gates. The release workflow also invokes these application checks on the pinned candidate before deployment; no dedicated automated negative-case tests for the release/rollback scripts or live verifier are present in the inspected test suites. A successful candidate build or workflow job is not a substitute for the independent live and governance assertions below.

For the route rows, use the returned `page_url` under `/lingua-lab/` (not the unprefixed dev URL). In a controlled test environment with a known previous stable artifact and an approved operator, capture the exact candidate SHA, required check-run IDs/conclusions, approval actor/time, release asset checksum, live `release-identity.json`, HTTP/final URL and app-specific rendered content per route, deployment/verification job results and step summary. Do **not** dispatch production to exercise failures; use mocked `gh`/HTTP fixtures for negative script cases and a non-production Pages-equivalent environment for browser/fallback and queue scenarios. If that environment or approvals are unavailable, mark those cases **not run**, not passed. Avoid brittle generic-heading-only or HTTP-200-only oracles: a cached, stale, generic error or `404.html` shell can return success without the intended application page.

| ID / risk | Current source check (implemented, **not executed here**) | Acceptance oracle and meaningful failure case (proposed unless explicitly implemented) |
| --- | --- | --- |
| C1 — exact candidate and CI | [`validate-candidate.sh`](../scripts/release/validate-candidate.sh) requires `release/homelab/YYYYMMDD`, exact equality to the current `master` tip, and successful `Application validation` and `Repository policy baseline` check runs for the resolved SHA; [`prd-release.yml`](../.github/workflows/prd-release.yml) checks out that SHA for build. [`release-gate.yml`](../.github/workflows/release-gate.yml) explicitly does **not** aggregate current-head review/check approval. | Fixture cases: reject invalid date/ref, candidate ahead/behind master, unresolved SHA, missing/pending/failed exact-SHA context and pre-existing tag/release; accept only an exact master tip with both successful contexts, then assert the build checkout SHA equals the validated SHA. Independently record the **human PR review and protected-branch/required-check evidence for that SHA** before approval; equality and check names alone do not prove independent approval or branch protection. Recheck policy if branch moves between validation and deployment; define whether to stop or revalidate. |
| C2 — trusted verification | [`prd-release.yml`](../.github/workflows/prd-release.yml) has a current YAML guard restricting its validation job to `master`; on a master dispatch, it checks out `${{ github.sha }}` for verification, separate from the candidate checkout in the build job. The guard is not independent GitHub enforcement of the dispatch ref (see [architecture](architecture.md)); [`prd-rollback.yml`](../.github/workflows/prd-rollback.yml) pins both target resolution and verification to that rollback dispatch's `${{ github.sha }}`. Both install Chromium and invoke [`verify-deployed-site.mjs`](../scripts/release/verify-deployed-site.mjs). | Inject candidate code that replaces its own verifier with unconditional success: live verification must still use the trusted workflow revision and fail on a deliberately broken site. Record checkout SHA/script provenance. The rollback checkout is pinned to the same workflow revision across resolution and verification. Do not accept a candidate-controlled verifier as independent evidence. |
| I1 — live artifact identity | [`prd-release.yml`](../.github/workflows/prd-release.yml) stamps `dist/release-identity.json` with pinned `source_sha` and archives the site; [`verify-deployed-site.mjs`](../scripts/release/verify-deployed-site.mjs) fetches that JSON at `PAGE_URL` and compares `sourceSha` to `SOURCE_SHA`. Rollback resolves the published tag commit, verifies the archive checksum, redeploys its retained artifact and compares its live identity to that commit. | Confirm exact 40-hex expected SHA, live marker **from the returned deployment URL**, and checksum/archived marker for rollback. Fail missing/404/malformed marker, absent or mismatched SHA, stale prior deployment, invalid checksum or missing artifact; do not equate a printed SHA in a job summary with a served artifact. Investigate tag/asset identity disagreement before deployment. Capture cache behavior/retry budget so an old CDN response fails closed rather than falsely passing. |
| R1 — release homepage | Live verifier requires HTTP success, the expected final path, the `Find your language.` level-one heading, a visible `Explore Nihongo learning path` link, and its target under the configured Pages base path. | On `/lingua-lab/`, fail if the link target is wrong, the route loses its base path, or an HTTP-200 error shell imitates only the heading. The verifier checks target semantics, not a full in-browser transition. |
| R2 — representative release deep routes | [`verify-deployed-site.mjs`](../scripts/release/verify-deployed-site.mjs) directly visits Kana, Grammar, Vocabulary, and first-introductions Grammar/Vocabulary routes under `page_url`; it checks route-specific selectors, final pathname and HTTP success, and reloads the Grammar lesson once. Kana requires `#basics`, `#practice`, and the practice-glyph marker; Grammar/Vocabulary routes require their lesson links; lessons require section IDs. Local [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts) additionally covers Kana refresh and local Pages fallback. | The production gate now exercises all named representative routes and one nested lesson refresh. It does not cover every route or every browser; no production run was executed here. Validate live fallback behavior and the full route matrix after an approved release, and treat absent production evidence as **not run**, not passed. |
| B1 — rollback selection, routes and truthful state | [`resolve-rollback-target.sh`](../scripts/release/resolve-rollback-target.sh) requires a published, non-draft/non-prerelease date-tagged release with archive and valid checksum; [`prd-rollback.yml`](../.github/workflows/prd-rollback.yml) waits for `prod` approval, redeploys, then runs the same live identity/route verifier. Its summary distinguishes `Rollback verified` from `Rollback unverified — manual intervention required` when deploy/verify results are not both success. Release verification failure dispatches a **separate** rollback workflow, not proof of recovery. | With a known stable fixture, require selected release SHA = archive marker = live marker and repeat R1/R2 on restored site, including direct deep-link refresh. Inject missing/invalid asset, failed deploy and HTTP-200 wrong-app/identity mismatch: no `verified` label; record job failure/manual intervention and live observations. **Gap:** summary job requires successful target resolution, so resolution failures only receive the resolver's stop summary; a deploy failure may leave verification skipped. Assert each branch reports the actual state rather than treating dispatch or redeploy action success as restored service. |
| A1 — approval wait and concurrency | Release has `prod` gates before deploy **and** stable publication; rollback has a `prod` gate before redeploy. [`prd-release.yml`](../.github/workflows/prd-release.yml) and [`prd-rollback.yml`](../.github/workflows/prd-rollback.yml) share workflow-level concurrency group `lingua-lab-production` with `queue: max`, covering each entire run including `prod` approval waits and post-deployment verification; `wc-release-pages.yml` deploys the caller's artifact to `github-pages`. GitHub permits up to 100 pending runs; further runs are canceled at capacity. Ordering follows when a run starts waiting and is not guaranteed to match dispatch-time order; this is not a durable queue. | In a non-production environment, hold release at each approval, request rollback, and start another release: verify whole-workflow serialization, pending-run behavior at capacity, and observed ordering without assuming dispatch-time FIFO or durable retention; no deploy/publish before its respective approval; never overlap grouped runs such that a later release overwrites a restored stable site unnoticed. Reject an unapproved/cancelled run; correlate approved SHA, observed run order and final live identity. **Remaining:** automated approval-wait/race coverage. |

Release exit criteria: independent named code verdict and human PR approval for the **current head**, protected-branch/check configuration confirmed for the candidate, C1/C2/I1/R1/R2/A1 evidence on the intended environment, and human production approval. Rollback exit criteria: resolved stable target/asset identity, explicit human approval, verified live B1/R1/R2 and truthful failure reporting. Until these are observed, the matrix is a set of acceptance cases, **not** a release sign-off. PR #4 test findings include [test-strategy comments 4123023797, 4123024045, 4123024363 and 4123024598](https://github.com/tranthaiminhtansoft/lingua-lab/pull/4/files) (trusted verifier, rollback verification, candidate approval, deep routes); [test-automation comment 4123023502](https://github.com/tranthaiminhtansoft/lingua-lab/pull/4/files) flags the weak Kana heading oracle. Local edits address some source-level concerns, but PR comments remain review evidence, not proof of an accepted fix.
