import { Link, useRouterState } from '@tanstack/react-router'

import styles from './Navigation.module.css'

export function Navigation() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const is404Page = pathname === '/404'

  return (
    <header className={styles.nav}>
      <Link
        to="/about"
        className={styles.logo}
        activeProps={{ className: `${styles.logo} ${styles.logoActive}` }}
      >
        V
        {!is404Page ? (
          <span className={styles.fullLogo}>
            ladimir
            <br />
          </span>
        ) : null}
        G{!is404Page ? <span className={styles.fullLogo}>orshunov</span> : null}
      </Link>

      {!is404Page ? (
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link
              to="/about"
              className={styles.link}
              activeProps={{ className: `${styles.link} ${styles.linkActive}` }}
            >
              ABOUT
            </Link>
          </li>
        </ul>
      ) : null}
    </header>
  )
}
