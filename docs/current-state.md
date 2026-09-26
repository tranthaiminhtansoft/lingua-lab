# Current product state and local operation

## Product state

The application is a React, TypeScript, and Vite language-learning workspace. The language home is the default page; Nihongo is the currently available learning path.

| Route | Purpose | State |
| --- | --- | --- |
| `/` | Language constellation home | Available; Nihongo is selectable and English is marked “Coming soon.” |
| `/nihongo-o-benkyuo` | Nihongo lesson list | Available; Kana is available, Grammar and Vocabulary are marked “Coming soon.” |
| `/nihongo-o-benkyuo/kana` | Kana lesson and practice | Available. |
| `/lessons/kana` | Previous Kana URL | Redirects to `/nihongo-o-benkyuo/kana`. |

Kana includes Hiragana, Katakana, and Romaji reference tables; Dakuten and Handakuten sound marks; Yōon, Sokuon, and Chōon sections; random recognition practice; and an animated, numbered stroke-order guide. Pronunciation uses browser/device Japanese speech support, so voice availability and behavior can vary by platform.

## Run and verify locally

Use the Node.js version recorded in [`.nvmrc`](../.nvmrc) and the lockfile-based install:

```sh
npm ci
npm run dev
```

Vite prints the local URL (normally `http://localhost:5173`). Open `/` for the language home or navigate to the routes above.

Available checks:

```sh
npm run lint
npm run typecheck
npm run test:unit -- --run
npm run build
npm run test:e2e
```

The end-to-end suite starts its own production-preview harness under the GitHub Pages base path and runs Chromium, Firefox, and WebKit projects. Playwright browsers must be installed for the selected projects; CI installs all three.

## Deployment status

The configured GitHub Pages project path is `/lingua-lab/`, and the target URL is `https://tranthaiminhtansoft.github.io/lingua-lab/`. This configuration does not establish that the site is currently published. The `PRD Release` workflow is manual-only and its readiness gate intentionally fails closed, so no build, deployment, or live-route verification can proceed through that workflow today. See [CI/CD](ci-cd.md) and the [release and rollback policy](release-and-rollback.md) before making deployment claims or attempting release operations.
