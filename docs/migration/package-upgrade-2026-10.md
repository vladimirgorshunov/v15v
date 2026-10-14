# Website package upgrade — 14 October 2026

This upgrade applies to the root website manifest and Bun lockfile. The separate
Sanity Studio manifest, lockfile, schemas and CMS content are unchanged.

## Runtime and compiler

- Bun 1.4.3 or newer; CI pins 1.4.3.
- Node 24.15.0 or newer; CI pins 24.21.0. This also satisfies jsdom 30's runtime
  requirements. Node typings remain on the latest 24.x release, 24.19.2.
- `@typescript/native` aliases `typescript@7.0.2` and provides the native `tsc`.
- `typescript` aliases `@typescript/typescript6@6.0.2`, providing `tsc6` and the
  legacy compiler API used by ESLint and configuration readers.
- `bun run typecheck` continues to run `tsc --noEmit`, now using TypeScript 7.
- The removed `baseUrl` option is gone; `@/*` still maps to `./src/*`.

The side-by-side compiler setup follows
[Microsoft's TypeScript 7 guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
Do not replace the compatibility alias with TypeScript 7 until API consumers such
as typescript-eslint support it. The Studio retains its own compiler dependency.

## Build and lint

- Vite 8.3.4 uses Rolldown/Oxc, with React plugin 6.1.2.
- TanStack Start 1.169.1, Router 1.170.44 and Router plugin 1.168.45 intentionally
  have different version numbers matching their published dependency contracts.
- Official Nitro 3.0.260903-beta replaces the old nightly alias. The Start plugin
  runs before Nitro. Static deployment still consumes `.output/public`.
- Prerender discovery/crawling stays enabled, excluding blog and static asset URLs.
- ESLint 10.12.0 is now an explicit development dependency; the flat TanStack
  configuration remains in use. Generated routes are excluded from lint/format.
- Formatting from the root excludes the separately maintained Studio.
- Playwright was refreshed to 1.64.1, a stable patch published on the upgrade day
  after the original plan had checked 1.64.0.

See the [Start migration guide](https://tanstack.com/start/latest/docs/framework/react/migrate-from-release-candidate)
and [Vite migration guide](https://vite.dev/guide/migration.html).

## Blog compatibility

Sanity Client 8 is ESM-only and uses fetch. Existing named imports, bundler module
resolution, API version, published perspective and read-only queries are retained.
No schema or dataset migration is required.

Portable Text 8 keeps the existing component API and requires React 19, now 19.3.0.
Lists starting deeper than level 1 or skipping levels now render their actual depth
and resume the original parent list. Regression tests accept this corrected HTML;
no content rewrites or list-marker CSS overrides are applied.

## Verification

Before the upgrade, root typecheck, lint, four unit tests and the production build
passed under Bun 1.4.3 and Node 24.16.0.

Final checks passed on Windows with Bun 1.4.3 and Node 24.16.0:

- A clean install in a new temporary directory using `bun install --frozen-lockfile`,
  with the root lockfile unchanged.
- TypeScript 7.0.2 and the compatibility compiler API (reported as 6.0.3), both
  checking the root project with `--noEmit`.
- ESLint with zero errors and zero warnings, plus formatting and diff whitespace checks.
- All 14 unit tests, including real Sanity Client 8 transport fixtures, failed and
  missing CMS reads, an unconfigured fresh process, custom Portable Text blocks
  and irregular ordered-list nesting.
- All seven Chromium browser tests: primary page, alias/unknown/missing-post
  redirects, unconfigured blog, static assets and theme persistence after reload.
  Browser tests reject page errors and React hydration errors.
- Production builds with Sanity configured and unconfigured, both prerendering
  `/` and `/404` and retaining the blog exclusion.
- Static artifact validation: all 11 assets referenced by the homepage and all
  20 font references exist, along with the error page, CV, manifest and favicon.

The build still reports upstream Rolldown warnings about TanStack's `use client`
directives and a code-splitting debug name. Vite also recommends its native
tsconfig-path resolver instead of the retained plugin. These are informational;
the build and runtime checks pass. CI's pinned Node 24.21.0 runtime is configured
but was not executed locally. No production deployment was performed.
