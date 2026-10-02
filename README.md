# Lingua Lab

Lingua Lab is a multi-language learning workspace. The Japanese learning path includes Kana, Grammar, and Vocabulary; English is marked as coming soon.

## Start locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev
```

The local routes are `/` for the language home, `/nihongo-o-benkyuo` for the Nihongo lesson list, and `/nihongo-o-benkyuo/kana` for Kana.

## Project documentation

- [Documentation index](https://tranthaiminhtansoft.github.io/lingua-lab/docs/)
- [Product and local operation](https://tranthaiminhtansoft.github.io/lingua-lab/docs/product.html)
- [Application topology](https://tranthaiminhtansoft.github.io/lingua-lab/docs/topology.html)
- [Delivery and release workflow](https://tranthaiminhtansoft.github.io/lingua-lab/docs/delivery.html)

These are the configured GitHub Pages documentation URLs; publication at these routes has not yet been verified. The standalone HTML sources are in `src/business/docs/`; the dated plan in `docs/superpowers/plans/` remains a historical artifact. Export the pages and interactive diagrams to `dist/docs` with:

```sh
npm run build
```

## Contribution basics

- Production branch: `master`.
- Development work belongs on `develop/homelab/<slug>` branches; pull requests target `master`.
- CI is configured for pull requests targeting `master` when at least one changed path matches its allowlist; it is not configured to run on pushes to `master`. Workflow-only, release-script, and standalone-doc changes do not match that allowlist. See [Delivery and release workflow](https://tranthaiminhtansoft.github.io/lingua-lab/docs/delivery.html) for the configured checks.
- GitHub `prod` and `github-pages` environments are configured for `master`; `prod` requires approval from `tranthaiminhtansoft`. The configured Pages URL is a target, not evidence of a live deployment.

## License

MIT; see [`LICENSE`](LICENSE).
