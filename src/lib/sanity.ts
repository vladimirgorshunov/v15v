import { createClient } from '@sanity/client'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID
const dataset = import.meta.env.VITE_SANITY_DATASET
const apiVersion = import.meta.env.VITE_SANITY_API_VERSION ?? '2026-02-12'
const useCdn = import.meta.env.VITE_SANITY_USE_CDN !== 'false'

export const isSanityConfigured = Boolean(projectId && dataset)

export const sanityClient = isSanityConfigured
  ? createClient({
      apiVersion,
      dataset,
      perspective: 'published',
      projectId,
      useCdn,
    })
  : null
