# Lingua Lab

Lingua Lab is a multi-language learning workspace. The current learning path is Nihongo, with Kana available and Grammar and Vocabulary marked as coming soon.

## Start locally

Requires the Node.js version in [`.nvmrc`](.nvmrc).

```sh
npm ci
npm run dev
```

The local routes are `/` for the language home, `/nihongo-o-benkyuo` for the Nihongo lesson list, and `/nihongo-o-benkyuo/kana` for Kana.

## Project documentation

- [Documentation index](docs/README.md)
- [Current product state and local operation](docs/current-state.md)
- [Application architecture and routing](docs/architecture.md)
- [CI/CD workflows and release state](docs/ci-cd.md)
- [Release and rollback policy](docs/release-and-rollback.md)
- [UI exploration references](docs/ui-explorations/)

The dated plan in `docs/superpowers/plans/` is a historical planning artifact; use the current-state and architecture documents for the implementation as it exists now.

## Contribution basics

- Production branch: `master`.
- Development work belongs on `develop/homelab/<slug>` branches; pull requests target `master`.
- CI is path-scoped. See [CI/CD](docs/ci-cd.md) for the exact triggers and checks.
- Production deployment is currently fail-closed and is not enabled. The configured GitHub Pages URL is a target, not evidence of a live deployment.

## License

MIT; see [`LICENSE`](LICENSE).
