import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test'

// Configure a real client before importing the modules that capture Vite's env.
const previousProjectId = process.env.VITE_SANITY_PROJECT_ID
const previousDataset = process.env.VITE_SANITY_DATASET
process.env.VITE_SANITY_PROJECT_ID = 'v15vtest'
process.env.VITE_SANITY_DATASET = 'test'

const { sanityClient } = await import('@/lib/sanity')
const { getBlogPosts, getBlogPostBySlug, formatPostDate } =
  await import('@/lib/blog')

if (previousProjectId === undefined) {
  delete process.env.VITE_SANITY_PROJECT_ID
} else {
  process.env.VITE_SANITY_PROJECT_ID = previousProjectId
}
if (previousDataset === undefined) {
  delete process.env.VITE_SANITY_DATASET
} else {
  process.env.VITE_SANITY_DATASET = previousDataset
}

if (!sanityClient) {
  throw new Error('The Sanity test client must be configured')
}

const clientConfig = sanityClient.config()
const post = {
  _id: 'post-1',
  title: 'Migration fixture',
  slug: 'migration-fixture',
  content: [],
}

afterEach(() => {
  sanityClient.config(clientConfig)
})

describe('Sanity blog reads', () => {
  test('reads published posts through the client fetch transport', async () => {
    const fetchRequest = mock((_input: string) =>
      Promise.resolve(Response.json({ result: [post], ms: 1 })),
    )
    sanityClient.config({ resolveFetch: () => fetchRequest })

    expect(await getBlogPosts()).toEqual([post])
    const [input] = fetchRequest.mock.calls[0] ?? []
    const url = new URL(String(input))
    expect(url.pathname).toContain('/data/query/test')
    expect(url.searchParams.get('perspective')).toBe('published')
    expect(url.searchParams.get('query')).toContain('_type == "post"')
  })

  test('passes the slug as a query parameter for post detail', async () => {
    const fetchRequest = mock((_input: string) =>
      Promise.resolve(Response.json({ result: post, ms: 1 })),
    )
    sanityClient.config({ resolveFetch: () => fetchRequest })

    expect(await getBlogPostBySlug(post.slug)).toEqual(post)
    const [input] = fetchRequest.mock.calls[0] ?? []
    const url = new URL(String(input))
    expect(url.searchParams.get('$slug')).toBe(JSON.stringify(post.slug))
    expect(url.searchParams.get('query')).toContain('"url": asset->url')
  })

  test('returns null when a published post is missing', async () => {
    sanityClient.config({
      resolveFetch: () => () =>
        Promise.resolve(Response.json({ result: null, ms: 1 })),
    })

    expect(await getBlogPostBySlug('missing-post')).toBeNull()
  })

  test('rejects and logs when CMS reads fail', async () => {
    sanityClient.config({
      resolveFetch: () => () =>
        Promise.resolve(new Response('Server error', { status: 500 })),
    })
    const logged = spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(getBlogPosts()).rejects.toThrow(
        'Blog content is temporarily unavailable.',
      )
      await expect(getBlogPostBySlug(post.slug)).rejects.toThrow(
        'Blog content is temporarily unavailable.',
      )
      const events = logged.mock.calls
        .map(([line]) => String(line))
        .filter((line) => line.includes('sanity_fetch_failed'))
        .map((line) => JSON.parse(line) as { event: string; query: string })
      expect(events).toMatchObject([
        { event: 'sanity_fetch_failed', query: 'posts' },
        { event: 'sanity_fetch_failed', query: 'post' },
      ])
    } finally {
      logged.mockRestore()
    }
  })

  test('returns safe results without CMS configuration in a fresh process', () => {
    const result = Bun.spawnSync(
      [
        process.execPath,
        '--eval',
        `import { getBlogPosts, getBlogPostBySlug } from './src/lib/blog.ts';
         console.log(JSON.stringify([await getBlogPosts(), await getBlogPostBySlug('missing')]));`,
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VITE_SANITY_PROJECT_ID: '',
          VITE_SANITY_DATASET: '',
        },
      },
    )

    expect(result.exitCode).toBe(0)
    expect(JSON.parse(result.stdout.toString())).toEqual([[], null])
  })

  test('handles absent and invalid publication dates', () => {
    expect(formatPostDate()).toBe('')
    expect(formatPostDate('not-a-date')).toBe('')
    expect(formatPostDate('2026-10-14T12:00:00Z')).toBe('October 14, 2026')
    const previousTimezone = process.env.TZ
    try {
      process.env.TZ = 'Pacific/Kiritimati'
      expect(formatPostDate('2026-03-01T23:30:00Z')).toBe('March 1, 2026')
    } finally {
      if (previousTimezone === undefined) {
        delete process.env.TZ
      } else {
        process.env.TZ = previousTimezone
      }
    }
  })
})
