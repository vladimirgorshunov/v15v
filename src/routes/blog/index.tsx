import { Link, createFileRoute } from '@tanstack/react-router'

import styles from '@/components/blog/blogRoutes.module.css'
import { formatPostDate, getBlogPosts } from '@/lib/blog'
import { isSanityConfigured } from '@/lib/sanity'

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const posts = await getBlogPosts()
    return { posts }
  },
  component: BlogIndexRoute,
})

function BlogIndexRoute() {
  const { posts } = Route.useLoaderData()

  if (!isSanityConfigured) {
    return (
      <section className={styles.emptyState}>
        Sanity is not configured yet. Add <code>VITE_SANITY_PROJECT_ID</code> and{' '}
        <code>VITE_SANITY_DATASET</code> in your environment.
      </section>
    )
  }

  if (posts.length === 0) {
    return <section className={styles.emptyState}>No published blog posts yet.</section>
  }

  return (
    <ul className={styles.postList}>
      {posts.map((post) => {
        const metaParts = [formatPostDate(post.publishedAt), post.authorName].filter(
          Boolean,
        )

        return (
          <li className={styles.postCard} key={post._id}>
            <Link className={styles.postLink} params={{ slug: post.slug }} to="/blog/$slug">
              <h2 className={styles.postHeading}>{post.title}</h2>
            </Link>
            {metaParts.length ? (
              <p className={styles.postMeta}>{metaParts.join(' · ')}</p>
            ) : null}
            {post.excerpt ? <p className={styles.postExcerpt}>{post.excerpt}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}
