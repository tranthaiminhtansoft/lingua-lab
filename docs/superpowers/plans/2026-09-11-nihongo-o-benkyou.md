# Lingua Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a mobile-first GitHub Pages app for the `lingua-lab` multi-domain product, beginning with the Nihongo domain for comparing and practising Hiragana and Katakana with Romaji and browser-native Japanese speech.

**Architecture:** A static React + TypeScript + Vite single-page app consumes one canonical kana dataset for both comparison tables and random practice. A dedicated speech hook wraps the browser Web Speech API with explicit support/error states; the app has no API, account, persistence, analytics, cookies, or audio assets.

**Tech Stack:** React, TypeScript, Vite, CSS, Vitest, React Testing Library, Playwright, GitHub Actions, GitHub Pages.

**Spec:** This plan is the approved specification. Its decisions are the user-confirmed scope in the manager brief dated 2026-09-11.

**Open questions:** none.

## Confirmed Decision Record — CI/CD and Bounded Production Recovery

- **Approval status:** Approved by the user in the 2026-09-11 Manager Brief; this plan update may change documentation only. Creating workflows, committing, merging, deploying, configuring GitHub, or handling a real PAT requires a later execution authorization.
- **Confirmed scope:** Exactly four workflow files separate PR CI, PR/current-head release gating, production release, and production rollback. Production rollback is approval-gated, metadata-bound, idempotent, non-force, and may create exactly one PAT-authenticated revert commit only after known-good recovery verification passes.
- **Confirmed trigger decisions:** PR CI runs only for `pull_request` targeting `master`; production release runs only for `push` to `master` and has no `workflow_dispatch`; rollback is a separate `workflow_run` consumer of completed `PRD Release` runs.
- **Confirmed evidence decisions:** `workflow_run.conclusion`, an issue label/body, actor name, commit message, or trailer alone never authorizes rollback. Authorization requires a schema-versioned rollback candidate joined to trusted GitHub run, artifact, deployment, verification, and recovery metadata.
- **Confirmed failure policy:** Missing approval, stale `master`, missing/expired/tampered artifacts, metadata mismatch, an active/conflicting/ambiguous duplicate, push rejection/conflict, or failed recovery verification leads to evidence preservation and `MANUAL_STOP`; an exact duplicate of a finalized `REVERTED` or `MANUAL_STOP` record exits no-op with evidence. No automatic retry, second revert, reset, or force-push is allowed.
- **Confirmed secret policy:** Documentation uses `[REDACTED]`. The fine-grained PAT is repository-scoped with minimum required Contents write, protected by a GitHub Environment, and made available only to the final revert job after recovery verification passes.
- **Assumptions to verify before enabling automation:** GitHub Pages, Actions artifacts, Deployment API, protected Environments, required reviewers, repository security features, and a narrowly scoped ruleset bypass are available for the actual repository. Repository owner, environment names, reviewer identities, rollback principal, retention window, and PAT rotation owner are deliberately not guessed; live API/UI read-back must supply them or automated rollback remains disabled.

## Global Constraints

- Repository name and Pages project path: `lingua-lab` and `/lingua-lab/`.
- Work only on `develop/homelab/<slug>` branches; never write application code directly on master.
- master must require pull requests and must reject direct push, deletion, and force-push.
- MVP kana inventory: 46 basic pairs, 20 dakuten pairs, and 5 handakuten pairs; exclude yōon, obsolete kana, small kana, `ゔ`/`ヴ`, and foreign-sound Katakana.
- Keep basic, dakuten/ten-ten (`゛`), and handakuten/maru (`゜`) visually separate.
- Expose English and Japanese copy together in the learning guide. The practice cue remains exactly `Hãy phát âm to chữ này`.
- Use `SpeechSynthesis` / `SpeechSynthesisUtterance` with `lang = 'ja-JP'`; do not add, download, or redistribute audio assets.
- Browser target: current Chrome, current Edge, Safari on current iPhone/iPad. Firefox speech is outside the acceptance scope.
- No quiz, scoring, localStorage, cookies, backend, login, analytics, tracker, or network request from the application.
- **CI scope policy:** Do not run application CI for unrelated-only changes. PR CI must use path filters for application/runtime/dependency/workflow/test/policy files; documentation-only, plan-only, and unrelated asset changes are excluded unless they affect the build, deployment, or required policy evidence. Required-check/ruleset behavior for skipped path-scoped workflows must be configured and verified so an intentionally out-of-scope PR is not falsely blocked or falsely reported as tested.
- Workflow display names are stable: `PR Continuous Integration`, `Release Gate`, `PRD Release`, and `PRD Rollback`.
- Required PR checks use the approved taxonomy: Quality (`Lint`, `Typecheck`, `Build`), Tests (`Unit Tests`, `Browser Smoke`), SAST (`CodeQL JavaScript/TypeScript`), SCA (`Dependency Review`, `npm audit policy`), SBOM (`SPDX` or `CycloneDX`), plus `License Policy`, `Artifact Provenance`, and the Release Gate checks including `profile-review`. Dependabot, GitHub Secret Scanning, and Push Protection are repository controls whose enabled state must be read back; they are not represented by fake green jobs.
- Before any public release, require public current-head review evidence from `software-engineer`, `qa-platform-reviewer`, `ui-ux-reviewer`, and `learning-content-reviewer`; all actionable review threads must be resolved.
- Do not merge automatically. The user performs the final merge unless they explicitly authorize it in the same session.

## Product-Wide Neo-Brutalist Design System

Neo-Brutalism is the default visual language for the entire product, not only a prototype or a single lesson. It applies to the app shell, lesson catalog, lesson pages, practice card, navigation, buttons, cards, and visible interaction states.

- Use a Japanese-inspired palette: washi/cream backgrounds, ink black or navy text/surfaces, vermilion primary accent, indigo secondary accent, and sakura/yellow supporting accents.
- Use scoped design tokens for hard borders and hard shadows on cards, buttons, and main surfaces. Avoid unbounded global shadows that make dense learning content visually heavy.
- Use only minimal interaction feedback: hover, pressed, focus-visible, and subtle micro-interactions. Do not add strong motion, bouncing, rotating, or continuous animation.
- Preserve surface-appropriate contrast: dark ink/navy surfaces use white text; light cream/washi surfaces use dark text. Validate contrast for every accent combination.
- Every interactive target is at least 44×44px, has a visible focus state, and remains usable at 320px. Respect `prefers-reduced-motion` by removing transitions that are not essential.
- Kana tables prioritize glyph readability, cell spacing, font size, contrast, and local horizontal scrolling. Do not shrink or clip kana to force a table into a narrow viewport.
- The retained reference-only design inventory is `docs/ui-explorations/01-language-constellation.html`, `docs/ui-explorations/02-nihongo-home-page.html`, `docs/ui-explorations/03-nihongo-grammar-page.html`, and `docs/ui-explorations/04-nihongo-kana-page.html`. These are visual references only, not production source or deployment artifacts.

---

## Planned File Structure

```text
lingua-lab/
├── docs/
│   ├── release-and-rollback.md
│   ├── superpowers/plans/2026-09-11-nihongo-o-benkyou.md
│   └── ui-explorations/
│       ├── 01-language-constellation.html
│       ├── 02-nihongo-home-page.html
│       ├── 03-nihongo-grammar-page.html
│       └── 04-nihongo-kana-page.html
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── App.test.tsx
│   │   ├── AppShell.tsx
│   │   ├── main.tsx
│   │   └── router.tsx
│   ├── business/
│   │   ├── lesson-lobby/
│   │   │   ├── LessonLobbyPage.tsx
│   │   │   ├── LessonLobbyPage.test.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   ├── LessonCard.test.tsx
│   │   │   ├── lessonRegistry.ts
│   │   │   └── lessonTypes.ts
│   │   └── kana/
│   │       ├── KanaPage.tsx
│   │       ├── KanaPage.test.tsx
│   │       ├── types/kana.ts
│   │       ├── data/kana.ts
│   │       ├── data/kana.test.ts
│   │       ├── content/learningContent.ts
│   │       ├── components/BasicsGuide.tsx
│   │       ├── components/BasicsGuide.test.tsx
│   │       ├── components/KanaTables.tsx
│   │       ├── components/KanaTables.test.tsx
│   │       ├── components/PracticeCard.tsx
│   │       ├── components/PracticeCard.test.tsx
│   │       ├── components/SpeechButton.tsx
│   │       ├── hooks/useJapaneseSpeech.ts
│   │       ├── hooks/useJapaneseSpeech.test.ts
│   │       ├── lib/selectRandomKana.ts
│   │       └── lib/selectRandomKana.test.ts
│   ├── shared/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── styles/global.css
│   │   └── types/
│   └── test/setup.ts
├── e2e/smoke.spec.ts
├── scripts/verify-repo-policy.mjs
├── scripts/verify-profile-reviews.mjs
├── .github/
│   ├── dependabot.yml
│   ├── profile-reviewers.json
│   ├── pull_request_template.md
│   └── workflows/{ci.yml,release-gate.yml,prd-release.yml,prd-rollback.yml}
├── playwright.config.ts
├── vite.config.ts
├── vitest.config.ts
├── eslint.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
├── .nvmrc
├── README.md
└── LICENSE
```

## Milestone 0 — Create and Harden the Empty Public Repository

### Task 1: Create the repository and bootstrap policy artifacts

**Files:**
- Create: `.nvmrc`, `README.md`, `LICENSE`, `.gitignore`
- Create: `.github/pull_request_template.md`
- Create: `.github/profile-reviewers.json`
- Create: `docs/release-and-rollback.md`

**Interfaces:**
- Produces a public repository with a documented project purpose and a machine-readable list of the four required reviewer profiles.
- `profile-reviewers.json` uses `{ "requiredProfiles": ["software-engineer", "qa-platform-reviewer", "ui-ux-reviewer", "learning-content-reviewer"], "identityMapping": {} }`; an empty identity mapping must fail closed until trusted GitHub identities are configured.

- [ ] **Step 1: Create the GitHub public repository only after a separate user execution command**

Run:
```bash
gh repo create nihongo-o-benkyou --public --clone
cd nihongo-o-benkyou
git switch -c develop/homelab/bootstrap
```

Expected: the remote is public, local work starts on `develop/homelab/bootstrap`, and no application edit is made on master.

- [ ] **Step 2: Write repository policy documentation and template**

The PR template must contain exact English headings `## 🧩 WHAT CHANGED`, `## 🚀 BENEFIT`, and `## ✅ EVIDENCE`; it must require real commands/URLs as evidence and a statement that all comments were resolved. `docs/release-and-rollback.md` must state: release only after current-head checks and reviews; recovery never force-pushes or resets; the bounded recovery workflow may create exactly one non-force PAT revert commit only after the known-good redeploy passes verification, otherwise it stops for manual intervention.

- [ ] **Step 3: Configure and verify master rules**

Configure GitHub rulesets/branch protection to require pull requests, resolved conversations, the required check contexts, and to block direct pushes, branch deletion, and force-push. Query the live GitHub ruleset/branch-protection API afterward and record the returned rule IDs/settings in the PR evidence; do not claim enforcement from configuration commands alone.

- [ ] **Step 4: Commit bootstrap artifacts and open a PR**

Run:
```bash
git add .nvmrc README.md LICENSE .gitignore .github docs
git diff --cached --check
git commit -m "chore: bootstrap repository policy"
git push -u origin develop/homelab/bootstrap
gh pr create --base master --head develop/homelab/bootstrap --title "chore: bootstrap repository policy" --body-file .github/pull_request_template.md
```

Expected: a PR exists; do not merge it.

## Repository Evolution — `lingua-lab` Multi-Domain Target

The current implementation plan remains scoped to the Japanese MVP and its existing repository conventions. The intended broader product/repository direction is **`lingua-lab`**, where Japanese is one business domain alongside English and future languages. This section records the target structure for the next repository-level evolution; it does not authorize repository creation, migration, deployment, commit, or push.

The retained homepage concept is **Language Constellation**: a responsive, non-book language hub where Nihongo and English appear as navigable constellations in a shared sky. The canonical visual reference is `docs/ui-explorations/01-language-constellation.html`. The concept must remain usable on both desktop and phone, avoid login/dashboard card composition, preserve clear text entry points, and keep the two language routes `/lingua-lab/nihongo/` and `/lingua-lab/english/` as the navigation contract. The exploration is design reference only; implementation still requires a later approved design and implementation plan.

The current design files are stored under the `lingua-lab` documentation namespace at `docs/ui-explorations/`. `02-nihongo-home-page.html`, `03-nihongo-grammar-page.html`, and `04-nihongo-kana-page.html` represent the already-designed Nihongo domain pages; `01-language-constellation.html` represents the cross-domain homepage. Preserve these files during future implementation work unless the user explicitly approves replacement or deletion.

```text
lingua-lab/
├── index.html                    # Language hub: /lingua-lab/
│
├── nihongo/                      # Japanese learning domain
│   ├── index.html                # /lingua-lab/nihongo/
│   ├── kana/
│   │   └── index.html            # /lingua-lab/nihongo/kana/
│   └── grammar/
│       └── index.html            # /lingua-lab/nihongo/grammar/
│
├── english/                      # English learning domain
│   ├── index.html                # /lingua-lab/english/
│   ├── alphabet/
│   │   └── index.html            # /lingua-lab/english/alphabet/
│   └── grammar/
│       └── index.html            # /lingua-lab/english/grammar/
│
├── shared/
│   ├── styles/
│   ├── scripts/
│   └── assets/
│
├── docs/
├── package.json
└── README.md
```

### Business-domain boundaries

- `nihongo/` owns Japanese overview, Kana, grammar, examples, and Japanese-specific interactions/content.
- `english/` owns English overview, alphabet, grammar, examples, and English-specific interactions/content.
- `shared/` contains only genuinely cross-domain UI primitives, styles, scripts, and assets; language-specific lesson content stays in its owning domain.
- Each domain can evolve its information architecture and roadmap independently.
- Future domains such as `korean/`, `french/`, or `chinese/` are sibling domains and must not require renaming the repository.

### GitHub Pages route contract

When `lingua-lab` is implemented and published, folder `index.html` files should provide these canonical routes:

```text
https://tranthaiminhtansoft.github.io/lingua-lab/
https://tranthaiminhtansoft.github.io/lingua-lab/nihongo/
https://tranthaiminhtansoft.github.io/lingua-lab/nihongo/kana/
https://tranthaiminhtansoft.github.io/lingua-lab/nihongo/grammar/
https://tranthaiminhtansoft.github.io/lingua-lab/english/
https://tranthaiminhtansoft.github.io/lingua-lab/english/alphabet/
https://tranthaiminhtansoft.github.io/lingua-lab/english/grammar/
```

Assets and internal links must work under the `/lingua-lab/` project base path, not only from localhost. Direct navigation and refresh must be verified for every route. The previously checked `/lingua-lab/nihongo` and `/lingua-lab/english` URLs currently return GitHub Pages 404; route creation and deployment remain future work.

### Migration mapping from the current static pages

- `home-page.html` → `nihongo/index.html`, after confirming it is the Japanese landing page.
- `kana-page.html` → `nihongo/kana/index.html`.
- `nihongo-o-benkyou/grammar-page.html` → `nihongo/grammar/index.html`.
- Do not delete or move the current files until the new routes render identically and links/assets are verified.
- English pages are a separate domain; do not create them by copying Japanese lesson content and merely translating labels.

## Milestone 1 — Scaffold the Static Application and Independent CI Checks

### Task 2: Establish a reproducible Vite/React TypeScript project

**Files:**
- Create: `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`
- Create: `src/app/main.tsx`, `src/app/App.tsx`, `src/test/setup.ts`, `src/shared/styles/global.css`
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- `npm run lint`, `npm run typecheck`, `npm run test:unit -- --run`, `npm run build`, and `npm run test:e2e` are stable commands.
- Vite exports `base: process.env.GITHUB_ACTIONS ? '/nihongo-o-benkyou/' : '/'`.

- [ ] **Step 1: Scaffold without adding persistence or network dependencies**

Run:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test eslint
npx playwright install --with-deps chromium firefox webkit
```

Expected: dependencies are lockfile-pinned; no speech/audio, analytics, API, or storage package is added.

- [ ] **Step 2: Add failing app smoke test**

Create `src/App.test.tsx` with an assertion that the page exposes a level-one heading named `Nihongo O Benkyou` and an accessible `Next` button. Run:
```bash
npm run test:unit -- --run src/App.test.tsx
```
Expected: FAIL before the minimal UI exists.

- [ ] **Step 3: Implement the minimal app shell and make the test pass**

Create a semantic `<main>` with an `<h1>`, an empty layout region, and a native `button` named `Next`. Establish the Neo-Brutalist design tokens in `src/shared/styles/global.css`: Japanese-inspired palette, scoped hard borders/shadows, surface-specific text colors, visible focus, 44×44px targets, and reduced-motion behavior. Run:
```bash
npm run test:unit -- --run src/App.test.tsx
npm run lint
npm run typecheck
npm run build
```
Expected: all commands pass.

- [ ] **Step 4: Create PR Continuous Integration with explicit control boundaries**

Create only `.github/workflows/ci.yml` with display name `PR Continuous Integration` and `on.pull_request.branches: [master]`. Add an explicit `paths` allowlist for application/runtime/dependency/workflow/test/policy inputs, for example `src/**`, `e2e/**`, `public/**`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `eslint.config.js`, `scripts/**`, and `.github/workflows/**`; exclude docs-only, plan-only, and unrelated-only changes. If a shared asset or policy/documentation change affects the build or required evidence, include it explicitly in the allowlist. Define and verify how branch protection treats skipped path-scoped checks so documentation-only PRs are intentionally out of application CI without leaving required checks pending or claiming application validation. The workflow has no production Environment, PAT, deployment action, `pages: write`, `id-token: write`, or other production secret/capability. Use read-only defaults and elevate only the individual analysis job that demonstrably requires it. Pin every `uses:` reference, including GitHub-owned Actions, to a reviewed full commit SHA; never use `pull_request_target` to checkout, install, build, or execute untrusted PR code.

Expose stable, independently reportable boundaries:

- **Quality:** `Lint`, `Typecheck`, `Build`.
- **Tests:** `Unit Tests`, `Browser Smoke`; smoke-test the production `dist` locally with Chromium, Firefox, and WebKit projects covering declared desktop/mobile viewports.
- **SAST:** `CodeQL JavaScript/TypeScript`.
- **SCA:** `Dependency Review` plus an explicit `npm audit policy` defining severity threshold, production and build/dev dependency treatment, waiver approver/expiry, and fail-closed handling for the exact release lockfile. Dependabot is a separately configured repository service.
- **Secrets:** GitHub Secret Scanning and Push Protection are repository-level controls. `release-gate.yml` must query their live settings; do not create a placeholder `Secret Scan` job that can report green without those controls.
- **SBOM:** generate either SPDX or CycloneDX from the exact lockfile/build input, attach its digest to artifact evidence, and fail on malformed output.
- **Browser Verification:** PR `Browser Smoke` is local candidate validation; production and recovery Browser Verification are separate gates in the release workflows and use the real Pages URL.
- **Additional supply-chain gates:** `License Policy` and `Artifact Provenance`, with PR provenance kept distinct from production attestation.
- **DAST: Not applicable** — the approved product is static React/Vite with no backend/API. This is a documented scope decision, not a skipped required check or a claim that a DAST scan passed; reassess if a backend/API is added.

Every code-running job uses deterministic installation (`npm ci`) and reports its own status. Configure the `master` ruleset to require the exact emitted check contexts, not category labels. Pending, skipped, missing, stale, or failed checks block merge. Verify required contexts and live ruleset settings through the GitHub API after configuration; YAML alone is not enforcement evidence. Do not inject production secrets into `VITE_*`, build environments, source maps, browser tests, artifacts, or bundles. The user remains the only final merger unless separately authorized.

- [ ] **Step 5: Commit and push**


Run:
```bash
git add package.json package-lock.json vite.config.ts tsconfig.json vitest.config.ts playwright.config.ts eslint.config.js src .github/workflows/ci.yml
git diff --cached --check
git commit -m "chore: scaffold static learning app"
git push
```

## Milestone 1A — Establish the Lesson Lobby, Router, and Domain Boundaries

### Task 3: Add the routed learning lobby and lesson registry

**Files:**
- Create: `src/app/AppShell.tsx`, `src/app/router.tsx`
- Create: `src/business/lesson-lobby/LessonLobbyPage.tsx`, `LessonCard.tsx`, `lessonRegistry.ts`, `lessonTypes.ts`
- Create: `src/business/lesson-lobby/LessonLobbyPage.test.tsx`, `LessonCard.test.tsx`
- Create: `src/business/kana/KanaPage.tsx`, `KanaPage.test.tsx`
- Modify: `src/app/App.tsx`, `src/app/App.test.tsx`, `vite.config.ts`, `package.json`

**Interfaces:**
- `/` renders the Lesson Lobby; `/lessons/kana` renders the real Kana lesson.
- The router uses the Vite/GitHub Pages base path and supports direct navigation/refresh without hard-coded origin or asset paths.
- `lessonRegistry.ts` is the single source of truth for lesson id, title, Japanese title, path, availability, description, and lobby visual metadata.
- The registry includes an available `kana` entry and future `grammar` and `vocabulary` entries with `status: 'coming-soon'`.
- Only available lessons render an active navigation action. Coming-soon cards render a construction/house-under-building visual, are clearly disabled, and do not navigate as usable lessons.

- [ ] **Step 1: Write failing route and registry tests**

Assert `/` exposes the lobby heading and Kana card; the Kana card resolves to `/lessons/kana`; Grammar and Vocabulary are announced as coming soon and have no active lesson navigation; and unknown routes render an accessible not-found state.

- [ ] **Step 2: Add the real router and base-path configuration**

Use a client-side router with a basename derived from the Vite base configuration. Test both local root navigation and the production `/nihongo-o-benkyou/` base path. Do not hard-code an owner, origin, or absolute asset URL.

- [ ] **Step 3: Implement the game-inspired learning lobby**

Build a Japanese Neo-Brutalist lobby with a clear hero/header, lesson selection area, and responsive cards. Desktop cards use `transform: scale(1.03)` plus a stronger hard shadow on hover/focus. Mobile cards use tap-to-select, a selected state, and an explicit `Start` action. Keep motion minimal and honor `prefers-reduced-motion`.

- [ ] **Step 4: Verify domain boundaries**

Keep lobby/registry code under `business/lesson-lobby`, Kana-specific content and interactions under `business/kana`, and reusable primitives/tokens under `shared`. Do not create empty future business folders or fake progress state.

- [ ] **Step 5: Run focused checks**

Run:
```bash
npm run test:unit -- --run src/business/lesson-lobby src/business/kana/KanaPage.test.tsx
npm run lint && npm run typecheck && npm run build
```
Expected: PASS, with keyboard navigation, visible focus, 44×44px targets, and no route/base-path warnings.

## Milestone 2 — Model and Test the Canonical Kana Data

### Task 4: Build the single source of truth for kana

**Files:**
- Create: `src/business/kana/types/kana.ts`
- Create: `src/business/kana/data/kana.ts`
- Test: `src/business/kana/data/kana.test.ts`
- Create: `src/business/kana/content/learningContent.ts`

**Interfaces:**
- `KanaEntry = { hiragana: string; katakana: string; romaji: string; group: 'basic' | 'dakuten' | 'handakuten' }`.
- `kanaEntries: readonly KanaEntry[]` contains exactly 71 entries.
- Romanization follows modified Hepburn learner forms including `shi`, `chi`, `tsu`, `fu`, and `ji`.

- [ ] **Step 1: Write failing inventory tests**

Assert `kanaEntries.length === 71`; group counts are basic `46`, dakuten `20`, handakuten `5`; no entry contains `ゃ`, `ゅ`, `ょ`, `ャ`, `ュ`, or `ョ`; and every entry has non-empty three fields.

- [ ] **Step 2: Run the focused test**

Run:
```bash
npm run test:unit -- --run src/business/kana/data/kana.test.ts
```
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Add the exact inventory and learning content**

Add all 46 modern basic pairs, 20 voiced dakuten pairs, and five handakuten pairs. Add bilingual guide content for Hiragana, Katakana, Romaji, dakuten/ten-ten, and handakuten/maru; describe Web Speech as listening support, not pronunciation certification.

- [ ] **Step 4: Run focused and full quality checks**

Run:
```bash
npm run test:unit -- --run src/business/kana/data/kana.test.ts
npm run lint && npm run typecheck && npm run test:unit -- --run && npm run build
```
Expected: PASS.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/business/kana/types/kana.ts src/business/kana/data/kana.ts src/business/kana/data/kana.test.ts src/business/kana/content/learningContent.ts
git commit -m "feat: add canonical kana dataset"
```

## Milestone 3 — Build the Bilingual Guide and Comparison Tables

### Task 5: Render accessible mobile-first learning content

**Files:**
- Create: `src/business/kana/components/BasicsGuide.tsx`, `src/business/kana/components/KanaTables.tsx`
- Test: `src/business/kana/components/BasicsGuide.test.tsx`, `src/business/kana/components/KanaTables.test.tsx`
- Modify: `src/app/App.tsx`, `src/shared/styles/global.css`

**Interfaces:**
- `BasicsGuide` consumes learning content and renders English/Japanese term pairs.
- `KanaTables` consumes `readonly KanaEntry[]` and renders three separately labelled semantic tables.
- Tables use the Neo-Brutalist system without sacrificing readability: controlled hard borders, restrained hard shadows on the table surface, sufficient cell spacing, contrast-checked text, and local horizontal scrolling at narrow widths.

- [ ] **Step 1: Write failing guide/table tests**

Assert the guide has `Learn the basics` and `基本を学ぶ`, all five defined concepts, and three table captions for basic/dakuten/handakuten. Assert every table uses `<table>`, column headers `Hiragana`, `Katakana`, and `Romaji`, and every row derives values from the canonical dataset.

- [ ] **Step 2: Run focused tests and observe failure**

Run:
```bash
npm run test:unit -- --run src/business/kana/components/BasicsGuide.test.tsx src/business/kana/components/KanaTables.test.tsx
```
Expected: FAIL.

- [ ] **Step 3: Implement semantic components and responsive CSS**

Use semantic section headings, `<table>`, `<caption>`, `<thead>`, and `<th scope="col">`. Apply the Japanese-inspired Neo-Brutalist tokens and controlled hard border/shadow treatment to the page surfaces. At viewport width 320px, preserve text size and expose a labelled horizontal scroll container for wide tables rather than scaling or clipping. Use a 44×44px minimum target for interactive controls, visible focus styles, and no non-essential animation under `prefers-reduced-motion`.

- [ ] **Step 4: Verify**

Run:
```bash
npm run test:unit -- --run src/business/kana/components/BasicsGuide.test.tsx src/business/kana/components/KanaTables.test.tsx
npm run lint && npm run typecheck && npm run test:unit -- --run && npm run build
```
Expected: PASS.

- [ ] **Step 5: Commit**

Run:
```bash
git add src/business/kana/components src/app/App.tsx src/shared/styles/global.css
git commit -m "feat: add bilingual kana comparison tables"
```

## Milestone 4 — Implement Random Practice and Web Speech States

### Task 6: Implement deterministic random selection and keyboard behaviour

**Files:**
- Create: `src/business/kana/lib/selectRandomKana.ts`, `src/business/kana/components/PracticeCard.tsx`
- Test: `src/business/kana/lib/selectRandomKana.test.ts`, `src/business/kana/components/PracticeCard.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- `selectRandomKana(entries, previous, random)` returns one entry, never the immediate previous entry when the pool has two or more entries.
- `PracticeCard` accepts `entry`, `onNext`, and a speech-control child; it renders exactly one kana glyph and the exact Vietnamese cue after a change.
- Practice surfaces and buttons use the product-wide Neo-Brutalist tokens, Japanese-inspired palette, hard border/shadow characteristics, and surface-appropriate contrast.

- [ ] **Step 1: Write failing random-selection tests**

Test that the result belongs to the supplied list, excludes `previous` for a two-item pool, and returns the only entry for a one-item pool. Inject a deterministic `random` function; do not test with nondeterministic `Math.random` alone.

- [ ] **Step 2: Write failing interaction tests**

Assert `Next` changes the rendered entry, ArrowRight calls `onNext`, and ArrowRight does not fire when an editable control is focused or a modifier key is pressed. Assert the cue equals `Hãy phát âm to chữ này`.

- [ ] **Step 3: Implement minimal selection and interaction code**

Flatten the canonical 71 entries into the practice pool. Register and clean up a `keydown` listener. Keep Next a native button, never auto-speak, and use a polite `aria-live` region for the changed practice prompt. Use only minimal hover/pressed/focus feedback; do not add strong transitions or distracting animation.

- [ ] **Step 4: Verify**

Run:
```bash
npm run test:unit -- --run src/business/kana/lib/selectRandomKana.test.ts src/business/kana/components/PracticeCard.test.tsx
npm run lint && npm run typecheck && npm run test:unit -- --run && npm run build
```
Expected: PASS.

### Task 7: Wrap Web Speech API without hidden fallbacks

**Files:**
- Create: `src/business/kana/hooks/useJapaneseSpeech.ts`, `src/business/kana/components/SpeechButton.tsx`
- Test: `src/business/kana/hooks/useJapaneseSpeech.test.ts`
- Modify: `src/business/kana/components/PracticeCard.tsx`

**Interfaces:**
- `SpeechState = 'loading' | 'ready' | 'unsupported' | 'no-japanese-voice' | 'speaking' | 'error'`.
- The hook returns `{ state, speak(text), cancel() }` and sets `utterance.lang` to `ja-JP`.

- [ ] **Step 1: Write failing browser-API contract tests**

Mock unsupported APIs, delayed `voiceschanged`, no matching `ja` voice, a successful Japanese voice, and `speechSynthesis.speak` throwing. Assert the UI shows an honest unavailable state and disables the speech button when speech cannot run.

- [ ] **Step 2: Run the focused hook test**

Run:
```bash
npm run test:unit -- --run src/business/kana/hooks/useJapaneseSpeech.test.ts
```
Expected: FAIL.

- [ ] **Step 3: Implement speech lifecycle**

Check both Web Speech constructors; read voices immediately and after `voiceschanged`; choose a voice whose language begins with `ja`; create an utterance only after button activation; set `lang = 'ja-JP'`; cancel prior utterance before a new one; expose all states visibly and accessibly.

- [ ] **Step 4: Verify and commit**

Run:
```bash
npm run test:unit -- --run src/business/kana/hooks/useJapaneseSpeech.test.ts
npm run lint && npm run typecheck && npm run test:unit -- --run && npm run build
git add src/business/kana/lib src/business/kana/components/PracticeCard.tsx src/business/kana/components/SpeechButton.tsx src/business/kana/hooks
git commit -m "feat: add random practice and Japanese speech"
```

## Milestone 5 — Immutable Production Release

### Task 8: Build, attest, deploy, and verify one production artifact

**Files:**
- Create: `e2e/production-verification.spec.ts`, `.github/workflows/prd-release.yml`
- Create: `docs/release-and-rollback.md`, `scripts/verify-release-artifact.mjs`
- Modify: `playwright.config.ts`, `vite.config.ts`, `package.json`

**Interfaces:**
- `.github/workflows/prd-release.yml` has display name `PRD Release`. Its only trigger is `push` with `branches: [master]`; it has no `workflow_dispatch`, PR trigger, rollback deploy, or PAT revert job.
- Job boundaries are `Release Preflight`, `Build Production Artifact`, `SBOM`, `Attest Production Artifact`, `Deploy GitHub Pages`, `Browser Verification`, `Publish Verified Release Record`, and `Publish Rollback Candidate`. Rollback jobs exist only in `prd-rollback.yml`.
- A shared fixed production concurrency group with `cancel-in-progress: false` serializes both release and rollback runs. It does not replace the append-only recovery records and create-once idempotency checks.

- [ ] **Step 1: Prove the Pages artifact, metadata, and retention contracts before enabling release**

Confirm repository Pages/custom-domain behavior, Vite `base`, router basename, and one concrete Pages-compatible direct deep-link strategy. `/lessons/kana` must work on direct navigation and reload at the real production URL. Validate with a disposable fixture that the selected pinned Pages actions/APIs can redeploy the exact retained payload without running Vite again, expose deployment ID/status/environment/URL for API read-back, and retain Actions artifacts for the documented rollback window. Use immutable Actions artifacts plus append-only, checksum-bound release/recovery manifests associated with trusted workflow run IDs and GitHub Deployment statuses. If the artifact cannot be retained, retrieved, digest-verified, or bound to deployment metadata for the rollback window, keep automated rollback disabled; never substitute a rebuild.

- [ ] **Step 2: Test release preflight and no-loop decisions first**

Add fixtures proving acceptance only for `push` on `refs/heads/master` at the exact event SHA. Reject `workflow_dispatch`, wrong branch/repository, missing gate evidence, stale SHA, malformed recovery metadata, and forged commit trailers. Add tests proving a revert-triggered push is intentionally skipped only when a finalized trusted recovery record matches the pushed revert SHA, expected parent/failed SHA, failed and recovery deployment IDs, rollback run ID, configured rollback principal, and terminal state. Actor or commit text alone never triggers a skip. A missing/mismatched marker fails closed, performs no deploy, and creates no new rollback candidate.

- [ ] **Step 3: Build once and publish immutable release evidence**

For the exact event SHA, run deterministic install/build once, package the deployable bytes once, and calculate a payload SHA-256 digest. Record a schema-versioned manifest containing repository ID, source SHA, lockfile hash, workflow ID/path, run ID/attempt, artifact ID, payload digest, SBOM format/digest, provenance reference, retention expiry, and exact build marker. Upload the artifact/manifest before deploy. Repackaging required by a Pages API is allowed only if payload byte identity is independently preserved and rechecked; running `npm ci`, `npm run build`, or regenerating `dist` during recovery is prohibited.

- [ ] **Step 4: Deploy with least privilege and prove the deployed commit**

Use `contents: read` by default; grant `pages: write` and `id-token: write` only to the exact Pages/attestation jobs that need them. Pin every Action by full commit SHA. After deploy, query GitHub APIs and bind deployment ID, deployment status ID, production environment, deployed SHA, Pages URL, artifact ID/digest, source run, and build marker to the release manifest. Do not claim commit X deployed unless these values all agree and the deployment status reached success.

- [ ] **Step 5: Run production Browser Verification and publish one terminal record**

Run Playwright against the real Pages URL with explicit Chromium, Firefox, and WebKit projects over declared desktop and mobile viewports. Verify `/` and `/lessons/kana` direct navigation/reload, HTML/app bootstrap, exact build marker, JS/CSS/assets, base-path links, responsive behavior, first-party network failures, `pageerror`, uncaught exceptions, unhandled rejections, and console errors against a documented allowlist. HTTP 200 alone never passes. On PASS, append a verified-release record `{source_sha, run_id, artifact_id, payload_digest, deployment_id, deployment_status_id, verification_report_id, verification_report_digest, verified_at}`; the newest production record with PASS is the last-known-good. On verification failure after a proven successful deployment, publish exactly one rollback candidate and linked verification-issue marker; a pre-deploy failure publishes no candidate.

- [ ] **Step 6: Define and validate the rollback-candidate schema**

The candidate is size-bounded JSON parsed strictly as data and contains at least `schema_version`, `candidate_id`, `repository_id`, `release_workflow_id`, `release_run_id`, `release_run_attempt`, `failed_source_sha`, `deployment_id`, `deployment_status_id`, `environment`, `artifact_id`, `artifact_payload_sha256`, `verification_report_id`, `verification_report_sha256`, `verification_outcome`, last-known-good source/run/artifact/digest/deployment coordinates, `created_at`, and retention expiry. It is retrievable only through the triggering trusted run and is joined through GitHub APIs to the deployment, artifact, verification report, and append-only release record. An issue label/body is only a linked operational signal; it is never sufficient authorization.

## Milestone 6 — Approval-Gated Bounded Production Rollback

### Task 9: Validate a rollback candidate, redeploy known-good, and create at most one revert

**Files:**
- Create: `.github/workflows/prd-rollback.yml`, `scripts/verify-recovery-state.mjs`
- Modify: `docs/release-and-rollback.md`, `package.json`

**Interfaces:**
- `.github/workflows/prd-rollback.yml` has display name `PRD Rollback` and only this trigger topology:

```yaml
on:
  workflow_run:
    workflows: ["PRD Release"]
    types: [completed]
    branches: [master]
```

- `workflow_run` only starts read-only validation. Its `conclusion` is telemetry, never rollback authorization. The source workflow remains on the trusted default branch, and preflight never checks out or executes source/candidate content.
- Recovery state uses protected, append-only annotated Git tag refs under `refs/tags/recovery-ledger/<idempotency-key>/<state>`, created and read through the Git Refs/Tags APIs. The idempotency key is SHA-256 over canonical JSON containing `repository_id`, `failed_deployment_id`, `failed_source_sha`, `release_workflow_id`, `release_run_id`, and `release_run_attempt`. Each tag object contains canonical, schema-versioned JSON plus its checksum and links to the candidate/evidence; state is appended through new refs and an existing ref is never updated or deleted. A tag ruleset blocks update/deletion and permits creation only by the configured trusted rollback principal; retention is at least the rollback window. Missing, deleted, expired, non-canonical, checksum-mismatched, unauthorized, or ambiguous records fail closed. Live API read-back must prove the object/ref SHA, creator, ruleset evaluation, and complete state chain before each transition; automated rollback remains disabled until this contract is proven in the target repository.

- [ ] **Step 1: Write fail-closed trigger and candidate fixture tests**

Cover valid recovery and reject wrong repository/workflow ID/path/display name, non-`push` source event, non-`master` branch, stale/wrong head SHA, wrong run attempt, candidate missing/duplicate/expired/malformed/forged, verification not failed, pre-deploy failure, artifact/deployment/report digest mismatch, ambiguous deployment, and candidate already claimed or terminal. Verify that no mutation-capable job runs on rejection. Do not accept workflow conclusion, artifact filename, issue text/label, actor name, or commit message/trailer as a standalone trust source.

- [ ] **Step 2: Validate the trigger and prove failed SHA X actually reached production**

With read-only permissions, fetch the triggering run/candidate through GitHub APIs and verify repository identity, trusted workflow ID/path on the default branch, display name, source event/ref/SHA, run ID/attempt, and schema. Join candidate evidence to Deployment API read-back and require deployment ID/status/environment/URL, deployed SHA X, artifact ID/payload digest, source run, verification report digest, and served build marker to agree. Confirm the production deployment succeeded before the verification issue. Any missing or mismatched field publishes `MANUAL_STOP` evidence and ends without approval, download, deploy, PAT, retry, or revert.

- [ ] **Step 3: Resolve last-known-good and prepare a read-only claim proposal**

Select the most recent earlier production deployment whose append-only verification record is PASS; do not assume it is X's parent. Require its retained artifact ID, payload digest, source SHA/run, deployment ID/status, report digest, and build marker. Before approval, perform metadata validation only and emit a checksum-bound claim proposal in run output; do not download/stage the artifact, create a ledger ref, write repository/deployment state, expose a secret, or perform any other mutation. Read back the ledger namespace to reject any prior active, terminal, conflicting, malformed, or ambiguous record, but defer durable claim creation until after approval.

- [ ] **Step 4: Require protected Environment approval before the first production mutation**

The read-only jobs end at `WAITING_APPROVAL`. The first job able to perform any recovery or repository mutation is bound to a configured `<PROTECTED_ROLLBACK_ENVIRONMENT>` with required reviewers and prevent-self-review where supported. Do not guess the environment name or reviewer identities: query and record the live settings before enabling automation. Pending approval has no side effect; rejection, cancellation, or expiry of the documented operational approval window is recorded by control-plane evidence/operator runbook as terminal `MANUAL_STOP`. GitHub's waiting state must not be misreported as if workflow steps had already emitted `MANUAL_STOP`.

Immediately after approval, refetch all authoritative metadata and require remote `master == X`, the candidate and read-only proposal still match, deployment/artifact/report digests still match, and no newer production deployment/recovery exists. Under the shared fixed production concurrency group, use Git Ref API create-if-absent semantics to atomically create exactly one `CLAIMED` ref for the idempotency key before downloading or redeploying. Only the creator that reads back the exact expected ref/tag object may continue. If state changed while waiting, ref creation conflicts, or read-back differs, append `MANUAL_STOP` when safe and stop without recovery mutation. Release and rollback share `cancel-in-progress: false`; neither may cancel the other.

Duplicate handling is deterministic: an exact finalized `REVERTED` duplicate exits no-op with evidence; an exact finalized `MANUAL_STOP` duplicate exits no-op and preserves that terminal state; an existing exact `CLAIMED` or `REVERT_INTENT` without its expected terminal successor appends `MANUAL_STOP` and exits without resuming; conflicting key/tuple/checksum/owner/state records append `MANUAL_STOP`; and a missing/deleted/expired record that a later state requires also appends `MANUAL_STOP`. No duplicate branch may download, redeploy, expose the PAT, push, or create another revert.

- [ ] **Step 5: Redeploy exact known-good bytes without rebuilding and verify recovery**

Redeploy the retained last-known-good payload without checkout, dependency installation, source generation, or build. Recalculate its digest before and after any required staging/repackaging and bind the recovery deployment ID/status/environment/URL to the known-good SHA and payload digest. Run the same Browser Verification policy and matrix used after release, additionally requiring the served build marker and recovery deployment metadata to identify the known-good. A failed verification, missing artifact, digest drift, metadata mismatch, or advanced `master` enters `MANUAL_STOP`, preserves all reports, and schedules no retry.

- [ ] **Step 6: Make the PAT available only after recovery verification PASS**

Put the fine-grained PAT secret only in a configured protected `<PROTECTED_REVERT_ENVIRONMENT>` reached after Step 5 PASS. The plan and logs show only `[REDACTED]`. Require repository scope, only the minimum Contents read/write needed for a non-force commit/push, no workflow/admin scope, a configured rollback principal, expiry, rotation/revocation owner, masking, and secret-log scanning. Approval of one Environment is not assumed to authorize another; read back both policies. No untrusted action or candidate content runs in the PAT job. If PAT policy, environment approval, or live ruleset compatibility is absent, `MANUAL_STOP`; never fall back to `GITHUB_TOKEN` or widen bypass automatically.

- [ ] **Step 7: Prepare and push exactly one non-force revert commit**

Immediately before commit creation, require remote `master == X`, revalidate recovery deployment/verification PASS, ensure no prior revert intent/commit exists, and handle merge commits only after identifying and verifying the correct mainline parent; never guess `git revert -m`. Prepare the single revert commit locally and compute its expected SHA. Create and read back one append-only `REVERT_INTENT` ledger ref binding candidate ID, failed SHA/deployment, known-good and recovery deployment IDs/digest, expected parent, expected revert SHA, rollback run ID, and configured principal. Push once without force. Conflict, rejection, metadata mismatch, duplicate intent, or any uncertain outcome appends `MANUAL_STOP`; do not regenerate or push a second commit.

- [ ] **Step 8: Verify recovery metadata and prevent release/revert loops**

Read back remote `master`, commit parent/tree/actor, ruleset evaluation, recovery deployment, artifact digest, and verification report. Create and read back `REVERTED` only when all fields match the intent. A crash/rerun that finds `master` at the precomputed revert SHA may only reconcile the already-pushed commit against the durable intent and append the matching terminal record; if any fact is uncertain it appends `MANUAL_STOP`, and it never creates another commit. The push-triggered `PRD Release` waits behind shared concurrency and skips build/attest/deploy/candidate creation only when the finalized trusted recovery record matches exact event SHA, expected parent X, failed/recovery deployment IDs, rollback run ID, principal, and terminal state. Trailer text is corroboration only. The completed skipped release may trigger `PRD Rollback`, which finds no valid candidate and exits no-op with evidence. Any mismatch becomes `MANUAL_STOP`, with no retry/revert loop.

- [ ] **Step 9: Validate recovery state machine and operational evidence**

Test: release PASS; verification issue after successful deployment; failure before deployment; malformed/stale candidate; wrong repository/workflow/run attempt; wrong SHA/deployment/artifact/report digest; expired known-good; approval rejected/cancelled/expired; `master` advancing before and after approval; duplicate/concurrently queued `workflow_run`; exact terminal duplicate; active/conflicting/missing/deleted/expired ledger state; recovery verify failure; merge-commit ambiguity; push conflict; crash before/after each `CLAIMED`, `REVERT_INTENT`, push, `REVERTED`, and `MANUAL_STOP` transition; and forged revert text. Prove canonical-key/checksum generation, atomic create-if-absent behavior, protected tag ACL/retention, and API read-back. The happy path must prove one known-good redeploy and exactly one non-force revert only after recovery PASS. Negative paths must prove the PAT job did not run and production/`master` were not mutated; ledger-only terminal evidence is allowed only after approval or through the documented operator path. Run `actionlint` on all four workflows, permission review, secret-log scan, and live API read-back for deployments, artifacts, ledger refs/tag objects/ruleset, rollback-principal bypass, and protected Environments before enabling rollback.

## Milestone 7 — Current-Head Review and Repository/Release Gate

### Task 10: Add fail-closed policy verification and exact-head merge readiness

**Files:**
- Create: `scripts/verify-repo-policy.mjs`, `scripts/verify-profile-reviews.mjs`, `.github/workflows/release-gate.yml`
- Modify: `.github/profile-reviewers.json`, `.github/pull_request_template.md`, `docs/release-and-rollback.md`

**Interfaces:**
- `.github/workflows/release-gate.yml` has display name `Release Gate`; `profile-review` remains a job/check name inside it, not a fifth workflow.
- The gate validates branch/PR policy, trusted public review evidence for the exact current PR head, required-check rollup, repository security/readiness, licensing/attribution, and merge readiness. It never deploys, releases, or merges.

- [ ] **Step 1: Test policy scripts against fixture payloads**

Prove rejection of `master` as source, wrong branch prefix, missing profile, untrusted/missing identity mapping, stale/dismissed review, unresolved actionable thread, changed `headRefOid`, missing/failed/skipped required check, incompatible ruleset, and disabled required repository control. Prove acceptance only when all four current-head profile reviews are trusted/public/English, all conversations are resolved, every exact check is green on the same SHA, and the PR is cleanly mergeable.

- [ ] **Step 2: Implement read-only evidence collection without executing PR code**

Use trusted default-branch scripts and GitHub event/API metadata only; never checkout, install, build, or execute contributor code in the gate. Enforce source branch regex `^develop/homelab/[a-z0-9][a-z0-9-]*$`. Use minimum read permissions and grant `checks: write` only to the exact publisher step if needed. Trigger/re-evaluate safely when PR head or review evidence changes; use native required-conversation-resolution enforcement and a safe explicit rerun path where GitHub events do not fire on thread resolution. Fork or permission-limited cases fail closed rather than silently publishing green.

- [ ] **Step 3: Publish `profile-review` only for the exact current head**

For every required profile, require visible review/comment evidence such as `[software-engineer] Code clean. Approved`. If author identity prevents GitHub approval, use the documented visible COMMENT fallback only after verifying review URL, trusted identity, state, and exact SHA. Fetch `headRefOid` at start and immediately before publication; mismatch fails. A Hermes consultation alone never satisfies this public gate.

- [ ] **Step 4: Verify repository, release, security, and legal readiness**

Read back the live ruleset, exact required check contexts, resolved-conversation policy, rollback-principal narrow bypass compatibility, protected Environment/reviewer settings, Dependabot, GitHub Secret Scanning, Push Protection, Pages configuration, artifact retention, and current PR merge state. Require license owner selection, valid `LICENSE`, production/transitive dependency-license report, third-party inventory covering fonts/icons/images/templates/snippets/learning content/actions/packages, and generated `NOTICE`/attribution where required. `UNKNOWN`, `NOASSERTION`, custom, non-commercial, or incompatible licenses fail closed unless an owner-approved, expiring waiver exists. Do not claim privacy/legal compliance beyond the verified no-telemetry/cookies/account/backend/persistence scope.

- [ ] **Step 5: Report merge readiness without merging**

Query current `headRefOid`, checks, reviews, threads, ruleset evaluation, legal/security controls, and merge state one final time. Report merge-ready only when every item is current and green; do not merge. Record API/run URLs and identifiers without secrets, PAT values, private reviewer data, credential-bearing URLs, or sensitive metadata.

## Final Release Checklist

- [ ] Static structure tests prove exactly these four one-to-one mappings and no other workflow: `ci.yml` → `PR Continuous Integration`; `release-gate.yml` → `Release Gate`; `prd-release.yml` → `PRD Release`; `prd-rollback.yml` → `PRD Rollback`; no legacy `profile-review.yml` or fifth workflow exists.
- [ ] `ci.yml` runs only on `pull_request` into `master`, uses the explicit application/runtime/dependency/workflow/test/policy path allowlist, does not run for unrelated-only changes, and has the required Quality/Tests/SAST/SCA/SBOM checks. Skipped path-scoped checks are handled by verified ruleset logic so docs-only PRs are neither falsely blocked nor falsely reported as tested; the workflow has no production Environment, deploy action, PAT, or production write permission.
- [ ] Dependabot, GitHub Secret Scanning, and Push Protection are enabled and read back as repository controls; `DAST: Not applicable — static React/Vite, no backend/API` is documented rather than represented as a fake/skipped required check.
- [ ] `release-gate.yml` binds `profile-review`, repository/release readiness, legal/security controls, and required checks to the exact current PR head; it uses only trusted default-branch code plus GitHub API/event metadata, never checks out, installs, builds, tests, or executes PR code, and never merges or deploys. Four trusted public English profile reviews exist and actionable conversations are resolved.
- [ ] The PR branch matches `develop/homelab/<slug>`, is current with `master`, and the live ruleset requires the exact emitted check contexts. The user has separately authorized final merge; otherwise stop at merge-ready.
- [ ] `prd-release.yml` releases only on `push` to `master`, has no `workflow_dispatch`, builds once, attests the exact payload, deploys Pages, and publishes either a verified-release record or one deployment-bound rollback candidate after post-deploy verification failure.
- [ ] Production and recovery Browser Verification run Chromium, Firefox, and WebKit across declared desktop/mobile viewports and prove routes/reload, assets, build marker, runtime, console, and first-party network behavior; HTTP status alone is insufficient.
- [ ] `prd-rollback.yml` is triggered only by a completed `PRD Release` workflow run on `master`; the trigger starts read-only validation only. It requires a trusted schema-versioned candidate and GitHub API read-back, and treats `workflow_run.conclusion` as telemetry rather than authorization; issue text, actor, or commit trailer is never sufficient.
- [ ] Failed commit X is proven deployed only when deployment ID, status ID, environment, URL, deployed SHA, source run ID/attempt, artifact ID/payload digest, verification report ID/digest, and served build marker all agree through authoritative API read-back; remote `master` is rechecked before approval-side effects, redeploy, and revert.
- [ ] The known-good is the latest earlier production deployment with Browser Verification PASS. Its retained immutable artifact is digest-verified and redeployed without checkout/install/build; missing/expired/mismatched evidence leads to `MANUAL_STOP`.
- [ ] Protected Environment approval blocks before every recovery/repository write, artifact download/staging, production redeploy, and secret exposure. Pending approval causes no mutation. Immediately after approval, authoritative `master`, candidate/proposal, ledger, deployment, artifact, verification, and newer release/recovery state are refetched; rejection, cancellation, expiry, or changed state produces evidence plus terminal `MANUAL_STOP`. The PAT remains `[REDACTED]`, is fine-grained/repository-scoped/minimum Contents write, and is available only in a protected final revert job after recovery verification PASS.
- [ ] Shared concurrency plus protected append-only Git tag refs prove an atomic create-once claim using the canonical idempotency key. Tests require durable `CLAIMED`, `REVERT_INTENT` with precomputed revert SHA, and finalized trusted `REVERTED`/`MANUAL_STOP` records; actor identity and commit trailer are never standalone trust signals. Exact terminal duplicates exit no-op; active/conflicting/ambiguous/missing required records produce `MANUAL_STOP` without resumption. A skipped revert-triggered release may emit another `workflow_run`, but rollback exits no-op with evidence and performs no mutation. No duplicate/rerun/crash path may redeploy, expose PAT, push, or create a second revert.
- [ ] Any metadata mismatch, advanced `master`, approval failure, recovery verification failure, merge-parent ambiguity, push conflict/rejection, or uncertain outcome preserves evidence and performs no automatic retry, reset, force-push, or second revert.
- [ ] `actionlint`, permission review, fixture/state-machine tests, secret-log scan, and live API read-back for ruleset, Environments, deployments, artifacts, repository controls, and rollback-principal compatibility all pass before production automation is enabled.
- [ ] License owner choice, valid `LICENSE`, dependency/asset inventory, `NOTICE`/attribution, waiver policy, and public-repository secret/history checks pass; no PAT/token or credential-bearing metadata appears in source, Pages, SBOM, provenance, artifacts, summaries, or logs.
- [ ] No application backend, tracker, persistence layer, audio asset, or unapproved network request was introduced. The four files under `docs/ui-explorations/` remain design references only and are not treated as production source.
