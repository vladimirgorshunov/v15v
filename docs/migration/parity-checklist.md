# Feature Parity Checklist

## Routes and URL Behavior

- [x] `/` redirects to `/about`.
- [x] `/about` is the primary page.
- [x] `/404` exists and is addressable directly.
- [x] Unknown routes redirect to `/404`.

## Content Parity

- [x] About paragraph text is preserved.
- [x] CV link remains `"/static/CV.pdf"`.
- [x] Contact links preserved:
  - Github: `https://github.com/vladimirgorshunov`
  - Telegram: `https://t.me/gorshunov`
  - LinkedIn: `https://www.linkedin.com/in/gorshunovvladimir/`
  - Skype: `skype:gorshunov777?action`
  - Mail: `mailto:gorshunov.vladimir@gmail.com`
- [x] `yearsOfExperience` formula preserved:
  - `Math.floor((Date.now() - 1346533200000) / (1000 * 60 * 60 * 24 * 365))`

## Assets and Public Paths

- [x] `public/static/CV.pdf` serves at `/static/CV.pdf`.
- [x] `public/static/manifest.json` serves at `/static/manifest.json`.
- [x] Favicon and icon files preserved under `/static/img/icons/*`.
- [x] Legacy fonts copied to `/static/fonts/*` and loaded via `@font-face`.

## Behavior Inventory

- [x] History-style routing behavior preserved through TanStack Router redirects.
- [x] 404 visual content preserved (`CDIV`, `Try another page.`).
- [x] Typekit script + `localStorage._tk_cache` intentionally removed.
- [x] Legacy service-worker caching script intentionally not migrated.

## Baseline Comparison Notes

- Lighthouse baseline from legacy app: not captured in this repo.
- Bundle/load-time subjective baseline from legacy app: not captured in this repo.
- New stack includes CI checks for lint, typecheck, tests, and build.
