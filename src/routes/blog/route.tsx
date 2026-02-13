import { Outlet, createFileRoute } from '@tanstack/react-router'

import styles from '@/components/blog/blogRoutes.module.css'

export const Route = createFileRoute('/blog')({
  component: BlogRootRoute,
})

function BlogRootRoute() {
  return (
    <main className={styles.blogRoot}>
      <h1 className={styles.blogTitle}>Blog</h1>
      <p className={styles.blogSubtitle}>Articles are powered by Sanity CMS.</p>
      <Outlet />
    </main>
  )
}
