# Lingua Lab

Lingua Lab is a multi-language learning workspace. Its live Japanese learning path includes Kana, Grammar, and Vocabulary; English is marked as coming soon.

## Live site

- **Application:** [Open Lingua Lab on GitHub Pages](https://tranthaiminhtansoft.github.io/lingua-lab/)
- **Documentation:** [Open the documentation start page](https://tranthaiminhtansoft.github.io/lingua-lab/docs/)
- **Latest verified production release:** [20261003](https://github.com/tranthaiminhtansoft/lingua-lab/releases/tag/20261003), deployed from commit `177991a` on 2026-10-03. The Pages site changes only after a release deployment succeeds; changes merged to `master` are not automatically published.

Start with the documentation page if you are new to the repository. It explains what the product does, where to go next, and groups engineering references separately from release procedures.

## Start locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev
```

The local routes are `/` for the language home, `/nihongo-o-benkyuo` for the Nihongo lesson list, and `/nihongo-o-benkyuo/kana` for Kana.

## Contribution basics

- Production branch: `master`.
- Development work belongs on `develop/homelab/<slug>` branches; pull requests target `master`.
- CI is configured for pull requests targeting `master` when at least one changed path matches its allowlist; it is not configured to run on pushes to `master`. Changes limited to `.github/**`, `scripts/**`, or the README do not match that allowlist. Changes under `src/business/docs/**` do. See the [delivery reference](https://tranthaiminhtansoft.github.io/lingua-lab/docs/delivery.html) for the configured checks and release flow.
- Release Gate runs for every pull request to `master` and is the required merge check. It requires successful CI on the current PR head when changed files match the trusted base branch's CI allowlist. Changes limited to standalone Markdown such as `README.md` or `docs/ROADMAP.md` require only Release Gate.
- Production releases use the manual `Create PRD Release Branch` and `PRD Release` workflows. A successful release builds and deploys a Pages artifact, verifies production routes, then publishes a dated GitHub Release after its approval gate.

## Project documentation

The standalone HTML documentation sources are in `src/business/docs/`. `npm run build` exports them to `dist/docs`.

- [Start here](https://tranthaiminhtansoft.github.io/lingua-lab/docs/)
- [Procedures: pre-release, release, post-release, rollback](https://tranthaiminhtansoft.github.io/lingua-lab/docs/procedures.html)
- [Reference: application topology and delivery system](https://tranthaiminhtansoft.github.io/lingua-lab/docs/reference.html)

The dated plan under `docs/superpowers/plans/` is a historical project artifact, not the operator guide.

## License

MIT; see [`LICENSE`](LICENSE).
