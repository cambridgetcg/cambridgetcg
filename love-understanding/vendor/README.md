# Pinned Love Geometry core

This directory preserves the public npm release **@agenttool/love-geometry@0.1.0-dev.0** for offline, **build-time-only** execution in Node. It is an experimental development prerelease, not a stability or production-readiness promise.

## Source and integrity

- Exact metadata endpoint: https://registry.npmjs.org/@agenttool%2Flove-geometry/0.1.0-dev.0
- Exact tarball: https://registry.npmjs.org/@agenttool/love-geometry/-/love-geometry-0.1.0-dev.0.tgz
- npm integrity: `sha512-RODi00WbbYx+QLBTlEflDGSZb3rBzRyYJ8/gpNE6f7j6QqcVQPHUdLkDiSV3d4OX01PFFX/qstNyc9ksfzTuyQ==`
- Tarball SHA256 (also independently supplied by the parent): `43cfbf4b559aa6f573d9d7b7a60e2a7dce5dfa4aefe2bf5b9c92310c926a9db8`
- Original `dist/index.js` SHA256: `cf9d3fc48164d97076a2a2624bf0e8e2eb53417b4a62247c42e9087c28846423`

The exact registry response and compressed archive are retained as `love-geometry-0.1.0-dev.0.metadata.json` and `love-geometry-0.1.0-dev.0.tgz`. Both were downloaded directly from registry.npmjs.org. SHA512 integrity and the pinned SHA256 were checked **before** copying any allowlisted archive members. Members were read individually from the archive, not extracted with unrestricted `extractall`; duplicate paths and non-regular members were rejected.

`love-geometry/` contains these byte-for-byte original, explicitly allowlisted files:

- `package.json` (preserves `type: module` and upstream exports)
- `dist/index.js`, `dist/index.js.map`
- `dist/index.d.ts`, `dist/index.d.ts.map`
- `LICENSE`, `NOTICE`, `README.md`
- `schema/agenttool-love-geometry-v0.1.schema.json`
- `vectors/agenttool-love-geometry-v0.1.json`
- `kingdom.extension.json` (inert exported descriptor; not registered or activated)

The packed `CLAUDE.md` is not copied into the extracted package directory. Nothing is installed. No lifecycle, build, prepack, or other npm script in the preserved original manifest is executed. No source maps are needed at runtime; they are preserved only as original companion files. No credentials or private data are fetched or included. Hash verification establishes byte consistency, not publisher identity, safety, report truth, or authority.

## Offline build and verification

From the `love-understanding/` project directory:

```sh
node scripts/build.mjs
node scripts/build.mjs --check
```

Both modes verify the archive's SHA512 and SHA256, verify every allowlisted file against its source-bound SHA256 pin, and then import the original Node ESM module. Both check every expected field in the official packed vector, deep immutability, fixture validation, canonical serialization, and input-order invariance. Build writes only `site/scenarios.json` and `site/core-provenance.json`. `--check` recomputes both and compares exact bytes without writing or fetching. There are no dates, environment-dependent values, random values, or private inputs in generated fixtures.

The browser displays **prevalidated build-time fixtures**, not browser-executed Love Geometry. The original core requires `node:crypto` and `node:util/types`; do not patch those imports into a lookalike browser protocol. Only the parent-owned public `site/` is intended for deployment, not this vendor directory or repository history.

## Public synthetic inputs

The exact UTF-8 subject tokens (without a trailing newline) passed to the core's `sha256Id` are:

```text
love-understanding.examples/1:subject:Visitor
love-understanding.examples/1:subject:Host
love-understanding.examples/1:subject:Maker
love-understanding.examples/1:subject:Witness
love-understanding.examples/1:subject:Neighbour
love-understanding.examples/1:subject:Quiet seat
```

Scope tokens use `love-understanding.examples/1:scope:<id>`, with the exact IDs `welcome`, `divergence`, `rest`, `quiet`, and `empty`. All basis arrays are empty. The generated provenance repeats every token and resulting reference. These are invented, deliberately public examples—not anonymised people, private evidence, or agent identities. Hashing guessable labels provides no anonymity or privacy guarantee.

Each arrow is a directed, caller-attributed, unverified report, not a ranking, emotion, truth, consent, authority, or inferred reverse relation. Screen positions are layout only. Rest, quiet, refusal, departure, and empty snapshots require no penalty or automatic trigger. Reading input never authorises action.

## Licensing

AgentTool Love Geometry — **Copyright 2026 AgentTool contributors** — **Apache-2.0**.

The full, unmodified upstream license is at `love-geometry/LICENSE`; the full upstream notice is at `love-geometry/NOTICE`. Upstream documentation is at `love-geometry/README.md`. Generated `site/core-provenance.json` carries full license and notice text so a public site-only deployment retains accessible attribution. The upstream source repository is https://github.com/cambridgetcg/agenttool (package directory `packages/love-geometry`); the npm archive above, rather than a moving repository branch, is the source of the vendored bytes.
