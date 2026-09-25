# Lingua Lab

A public, multi-domain language-learning workspace. The initial product focus is the Nihongo learning domain; the current committed HTML files under [`docs/ui-explorations/`](docs/ui-explorations/) are design references, not production application source.

## Status

The React/Vite Kana MVP scaffold is present, with application source under [`src/`](src/) and local test coverage. On the current workspace, `npm run lint`, `npm run typecheck`, and `npm run build` completed successfully.

For local setup and development:

```sh
npm ci
npm run dev
```

Use `npm run lint`, `npm run typecheck`, and `npm run build` for the available local static checks and production build. Unit and end-to-end scripts are also defined as `npm run test:unit` and `npm run test:e2e`.

## GitHub Pages

The configured GitHub Pages target uses the repository project base path:

- `https://tranthaiminhtansoft.github.io/lingua-lab/`

This URL is a deployment target, not a claim of a live site. `PRD Release` is manual-only and its intentional fail-closed `Release readiness gate` exits with status 1, so its build, GitHub Pages deployment, and published-route verification jobs cannot run. Production release remains blocked until a human approves and implements the readiness gate, and the platform owner enables and verifies the required GitHub Pages/Actions and protected-environment configuration. Required current-head checks, review evidence, and human approval are still required before an authorized human may dispatch a release.

Do not use root-relative application asset URLs; use the `/lingua-lab/` base-path contract. See [`docs/release-and-rollback.md`](docs/release-and-rollback.md) for the canonical release and rollback state.

## Contribution policy

- Production branch: `master`.
- Development work belongs on `develop/homelab/<slug>` branches; never add application code directly to `master`.
- Pull requests target `master`; no workflow merges pull requests automatically.
- Application CI is path-scoped. Documentation-only, plan-only, and unrelated-only pull requests are intentionally outside application CI unless they affect build, deployment, workflow, or policy evidence.
- A production release is only eligible after current-head checks and required public reviews. Rollback, when implemented, must never force-push or reset history.

See [`docs/release-and-rollback.md`](docs/release-and-rollback.md) and the canonical [implementation plan](docs/superpowers/plans/2026-09-11-nihongo-o-benkyou.md).

## License

MIT; see [`LICENSE`](LICENSE).
