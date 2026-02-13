import { PortableText } from '@portabletext/react'
import { createFileRoute, redirect } from '@tanstack/react-router'

import styles from '@/components/blog/blogRoutes.module.css'
import { portableTextComponents } from '@/components/blog/portableTextComponents'
import { formatPostDate, getBlogPostBySlug } from '@/lib/blog'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const post = await getBlogPostBySlug(params.slug)
    if (!post) {
      throw redirect({ to: '/404' })
    }

    return { post }
  },
  component: BlogPostRoute,
})

function BlogPostRoute() {
  const { post } = Route.useLoaderData()
  const metaParts = [formatPostDate(post.publishedAt), post.authorName].filter(Boolean)

  return (
    <article className={styles.article}>
      <h1 className={styles.articleTitle}>{post.title}</h1>
      {metaParts.length ? <p className={styles.articleMeta}>{metaParts.join(' · ')}</p> : null}
      <div className={styles.articleBody}>
        <PortableText components={portableTextComponents} value={post.content} />
      </div>
    </article>
  )
}
