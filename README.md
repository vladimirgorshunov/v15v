# v15v

Personal website migrated to TanStack Start (React + TypeScript) with static prerendering.

## Stack

- TanStack Start + TanStack Router
- React 19 + TypeScript (strict)
- Bun package manager
- Sanity CMS (`@sanity/client`) for blog content
- Portable Text rendering (`@portabletext/react`) with custom block mappings
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
- `/blog` section root
- `/404` dedicated error page
- unknown routes redirect to `/404`
- `/static/CV.pdf` direct asset URL

## Blog CMS (Sanity)

The blog reads published `post` documents from Sanity. If Sanity environment
variables are not configured, `/blog` shows a safe setup message instead of
failing the build.

- Environment template: `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/.env.example`
- Setup details: `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/docs/blog/sanity.md`
- Portable Text custom component mapping:
  `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/src/components/blog/portableTextComponents.tsx`

## Migration Notes

- Legacy Typekit runtime/caching script was removed.
- Fonts are self-hosted from `/public/static/fonts`.
- Manifest and icon assets are retained under `/public/static`.
- AWS static deployment runbook:
  `/Users/vladimir.gorshunov@schibsted.com/projects/v15v/docs/deployment/aws-static.md`

See `/docs/migration/parity-checklist.md` and `/docs/migration/cutover.md` for details.
