# Application architecture

## Domain and page ownership

The current feature hierarchy follows the user-facing learning path:

```text
src/
  app/                         Application shell and route setup
  business/
    language-home/              Language selection home
      nihongo/                  Nihongo lesson hub and lesson registry
        kana/                   Kana reference, practice, content, and behavior
```

The former `lesson-lobby` feature folder is no longer part of the current source tree. Nihongo and its lesson features are owned under `business/language-home/nihongo/`.

## Routing

`src/app/router.tsx` defines the browser routes. The language home lives at `/`; the Nihongo hub and Kana lesson are nested at `/nihongo-o-benkyuo` and `/nihongo-o-benkyuo/kana`. The older `/lessons/kana` address redirects to the nested Kana route. Unknown lesson paths render the not-found view.

`AppShell` provides the shared brand and lesson navigation for the Nihongo routes. Lesson metadata is defined once in `nihongo/lessonRegistry.ts`; the hub and navigation use it to show available and coming-soon lessons consistently.

## Kana feature structure

`business/language-home/nihongo/kana/` keeps the page composition close to its feature-specific parts:

- `KanaPage.tsx` composes the basics guide, practice card, reference tables, and sound-mark sections.
- `components/` contains the visual and interactive units, including stroke-order writing guide and speech controls.
- `data/` and `content/` hold Kana entries and learning copy.
- `hooks/` encapsulates browser Japanese speech behavior.
- `lib/` contains small reusable selection logic.
- `types/` defines Kana and sound-mark data shapes.

Unit tests sit beside the feature and its components; browser smoke tests live in `e2e/`.

## Asset base path and GitHub Pages

Vite uses `/` during ordinary local development and `/lingua-lab/` when `GITHUB_ACTIONS` is set. React Router uses Vite's `BASE_URL` as its basename. The router also restores GitHub Pages' `?p=` fallback URL before routing, while rejecting external-origin fallback targets.

Use router links and base-aware asset URLs rather than hard-coded root-relative paths. The configured project path is part of the deployment contract even though production deployment is currently blocked; see [CI/CD](ci-cd.md).
