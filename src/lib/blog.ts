import { isSanityConfigured, sanityClient } from '@/lib/sanity'

export type PortableTextNode = {
  _key?: string
  _type: string
  [key: string]: {} | undefined
}

export type BlogPostListItem = {
  _id: string
  authorName?: string
  excerpt?: string
  publishedAt?: string
  slug: string
  title: string
}

export type BlogPost = {
  _id: string
  authorName?: string
  content: Array<PortableTextNode>
  excerpt?: string
  publishedAt?: string
  slug: string
  title: string
}

const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  excerpt,
  publishedAt,
  "authorName": author->name,
  "slug": slug.current
}`

const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  excerpt,
  publishedAt,
  "authorName": author->name,
  "slug": slug.current,
  content[] {
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  }
}`

export async function getBlogPosts(): Promise<Array<BlogPostListItem>> {
  if (!isSanityConfigured || !sanityClient) {
    return []
  }

  try {
    return await sanityClient.fetch<Array<BlogPostListItem>>(POSTS_QUERY)
  } catch {
    return []
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  if (!isSanityConfigured || !sanityClient) {
    return null
  }

  try {
    return await sanityClient.fetch<BlogPost | null>(POST_BY_SLUG_QUERY, { slug })
  } catch {
    return null
  }
}

export function formatPostDate(date?: string): string {
  if (!date) {
    return ''
  }

  const parsed = new Date(date)
  if (Number.isNaN(parsed.valueOf())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
  }).format(parsed)
}
