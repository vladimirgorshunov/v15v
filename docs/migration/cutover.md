# Cutover Guide

## 1. Stage Deployment

1. Deploy this app to a staging URL on your static host.
2. Configure host fallback rewrites to serve the app entry for SPA routes.
3. Verify static assets are directly reachable:
   - `/static/CV.pdf`
   - `/static/manifest.json`
   - `/static/img/icons/favicon-32x32.png`

## 2. Validation Checklist

1. Route parity:
   - `/` is the primary page
   - `/about` redirects to `/` (alias)
   - unknown URLs land on `/404`
2. Content parity:
   - about text and links are visible
   - `yearsOfExperience` value appears correctly
3. Asset parity:
   - CV download works
   - icons/manifest resolve without 404
4. Quality gates:
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test`
   - `bun run build`

## 3. Production Cutover

1. Point production host routing/DNS to the new deployment.
2. Re-run route and asset checks on production URLs.
3. Confirm no broken inbound links for `/about`, `/404`, or `/static/CV.pdf`.

## 4. Rollback Plan

1. Keep last known-good legacy build artifact available.
2. If critical regression occurs, restore previous hosting target immediately.
3. Open a follow-up fix ticket and re-run staging validation before next cutover.

## 5. Ongoing Maintenance

1. Keep TanStack Start dependencies pinned and upgraded on a regular cadence.
2. Review release notes before version bumps and run full CI checks.
