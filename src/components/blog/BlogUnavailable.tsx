import styles from './blogRoutes.module.css'

export const BlogUnavailable = () => {
  return (
    <section className={styles.emptyState}>
      Blog is temporarily unavailable. Please try again later.
    </section>
  )
}
