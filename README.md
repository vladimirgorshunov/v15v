# v15v

Personal website migrated to TanStack Start (React + TypeScript) with static prerendering.

## Stack

- TanStack Start + TanStack Router
- React 19 + TypeScript (strict)
- Bun package manager
- ESLint + Prettier
- Bun unit tests + Playwright e2e smoke tests

## Development

```bash
bun install
bun --bun run dev
```

The dev server runs on [http://localhost:3000](http://localhost:3000).

## Quality Gates

```bash
bun --bun run lint
bun --bun run typecheck
bun --bun run test:unit
bun --bun run test:e2e
bun --bun run build
```

## URL Contracts Preserved

- `/` redirects to `/about`
- `/about` main page
- `/404` dedicated error page
- unknown routes redirect to `/404`
- `/static/CV.pdf` direct asset URL

## Migration Notes

- Legacy Typekit runtime/caching script was removed.
- Fonts are self-hosted from `/public/static/fonts`.
- Manifest and icon assets are retained under `/public/static`.

See `/docs/migration/parity-checklist.md` and `/docs/migration/cutover.md` for details.
