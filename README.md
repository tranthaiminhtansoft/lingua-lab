# Lingua Lab

A public, multi-domain language-learning workspace. The initial product focus is the Nihongo learning domain; the current committed HTML files under [`docs/ui-explorations/`](docs/ui-explorations/) are design references, not production application source.

## Status

The repository currently contains planning and UI-exploration material plus repository/CI-CD policy. The React/Vite application has **not** been scaffolded or deployed. No production release should be inferred from this repository bootstrap.

## GitHub Pages

GitHub Pages is configured to deploy through GitHub Actions. When a deployable static application is added, it must work under the repository project base path:

- `https://tranthaiminhtansoft.github.io/lingua-lab/`

Do not use root-relative application asset URLs; use the `/lingua-lab/` base-path contract.

## Contribution policy

- Production branch: `master`.
- Development work belongs on `develop/homelab/<slug>` branches; never add application code directly to `master`.
- Pull requests target `master`; no workflow merges pull requests automatically.
- Application CI is path-scoped. Documentation-only, plan-only, and unrelated-only pull requests are intentionally outside application CI unless they affect build, deployment, workflow, or policy evidence.
- A production release is only eligible after current-head checks and required public reviews. Rollback, when implemented, must never force-push or reset history.

See [`docs/release-and-rollback.md`](docs/release-and-rollback.md) and the canonical [implementation plan](docs/superpowers/plans/2026-09-11-nihongo-o-benkyou.md).

## License

MIT; see [`LICENSE`](LICENSE).
