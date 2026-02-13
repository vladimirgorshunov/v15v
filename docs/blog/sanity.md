# Sanity Blog Setup

## Environment

Copy `.env.example` to `.env` and set:

- `VITE_SANITY_PROJECT_ID`
- `VITE_SANITY_DATASET`
- `VITE_SANITY_API_VERSION` (default: `2026-02-12`)
- `VITE_SANITY_USE_CDN` (`true` for production reads)

## Content Type Expectations

The frontend expects a Sanity document type named `post` with:

- `title` (string)
- `slug` (`slug.current`)
- `excerpt` (optional text)
- `publishedAt` (optional datetime)
- `author` (optional reference with `name`)
- `content` (Portable Text array)

## Custom Portable Text Components

Frontend mappings are defined in:

- `src/components/blog/portableTextComponents.tsx`

Supported custom block types today:

- `image`
- `callout`
- `codeBlock`

If these types are enabled in your Sanity Portable Text schema, they render automatically.
To add more allowed custom components, extend the `types` map in the same file.
