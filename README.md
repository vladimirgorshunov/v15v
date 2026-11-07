# v15v

Personal website built with TanStack Start (React + TypeScript), server-rendered by AWS Lambda behind CloudFront.

## Stack

- TanStack Start 1.169.4 + TanStack Router 1.170.46
- React 19 + TypeScript (strict)
- Bun package manager
- Sanity CMS (`@sanity/client`) for blog content
- Portable Text rendering (`@portabletext/react`) with custom block mappings
- Native `bun lint` + `bun fmt` (configured in `bunfig.toml`)
- Bun unit tests + Playwright e2e smoke tests

## Development

Use Bun canary (`bun upgrade --canary`) and Node 26.13.0 LTS or newer.
CI and deployment use rolling Bun canary via `oven-sh/setup-bun` and pin
Node 26.13.0; Node typings follow the 26.x runtime. Canary provides native `bun lint`.

```bash
bun install
bun --bun run dev
```

The dev server runs on [http://localhost:4040](http://localhost:4040).

`bun run typecheck` uses the native TypeScript 7 compiler. The `typescript`
dependency aliases the TypeScript 6 compatibility package for
tools that still require the compiler API; `@typescript/native` supplies `tsc`.
See [the package upgrade notes](docs/migration/package-upgrade-2026-10.md).

## Quality Gates

```bash
bun lint
bun --bun run typecheck
bun --bun run typecheck:all
bun --bun run test:unit
bun run test:e2e
bun run build
```

Build with Node via `bun run build`, not `bun --bun run build`. Nitro detects
host-runtime built-ins: forcing Bun treats `undici` as built-in and omits it
from the Node Lambda bundle.

Native lint uses type-aware TanStack rules, with `unicorn/prefer-node-protocol`
replacing the Node rule. The unsupported spaced-comment rule is omitted;
`only-throw-error` is off for TanStack redirects. `no-var` and `prefer-const`
remain errors. Generated routes and the separately maintained Studio are excluded.
The Studio retains its Sanity ESLint configuration.

Dependency security refresh (2026-11-07): website audit is clean; Studio has
18 upstream-range-blocked advisories (11 high, 7 moderate, none critical).
The remaining packages are `adm-zip`, `js-yaml` 3, `minimatch` 9/10, and
`uuid` 8/10. No dependency overrides are used. Studio stays on Sanity 5,
ESLint config 6, and TypeScript 5; Node typings follow Node 26 and jsdom stays on 30.

CI and production deployment jobs are pinned to `ubuntu-26.04` so
`ubuntu-latest` migrations do not change the runner OS unexpectedly.
Playwright is pinned to `1.65.0`, which includes Ubuntu 26.04 platform and
browser dependency support.

## URL Contracts Preserved

- `/` main page
- `/about` redirects to `/` (alias)
- `/blog` section root
- `/404` dedicated error page with HTTP 404
- unknown routes and missing posts redirect (307) to `/404`
- `/static/CV.pdf` direct asset URL

## Blog CMS (Sanity)

The blog reads published `post` documents from Sanity. If Sanity environment
variables are not configured, `/blog` shows a safe setup message instead of
failing the build.
The Sanity `body` field maps to `BlogPost.content`; publication dates use UTC
on both server and client to avoid hydration differences.

- Environment files: `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/.env/.env*`
- Environment template: `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/.env.example`
- Setup details: `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/docs/blog/sanity.md`
- Portable Text custom component mapping:
  `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/src/components/blog/portableTextComponents.tsx`

## Migration Notes

- Legacy Typekit runtime/caching script was removed.
- Fonts are self-hosted from `/public/static/fonts`.
- Manifest and icon assets are retained under `/public/static`.
- [AWS SSR deployment runbook](docs/deployment/aws-static.md)

See `/docs/migration/parity-checklist.md` and `/docs/migration/cutover.md` for details.
