import { useEffect, useState } from 'react'

import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'v15v-theme'
const THEME_META_COLOR: Record<Theme, string> = {
  light: '#4DBA87',
  dark: '#1b1712',
}
const THEME_LABEL: Record<Theme, string> = {
  light: 'Light',
  dark: 'Dark',
}
const THEME_ICON: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
}
const OPPOSITE_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'light',
}

const isTheme = (value: string | null): value is Theme =>
  value === 'light' || value === 'dark'

const applyTheme = (theme: Theme): void => {
  document.documentElement.setAttribute('data-theme', theme)

  const themeColorMeta = document.querySelector('meta[name="theme-color"]')
  themeColorMeta?.setAttribute('content', THEME_META_COLOR[theme])
}

const readInitialTheme = (): Theme => {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (isTheme(stored)) {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const nextTheme = readInitialTheme()
    setTheme(nextTheme)
    applyTheme(nextTheme)
  }, [])

  const onToggle = () => {
    const nextTheme = OPPOSITE_THEME[theme]
    setTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
    applyTheme(nextTheme)
  }

  return (
    <button
      aria-label={`Switch to ${OPPOSITE_THEME[theme]} theme`}
      className={styles.toggle}
      onClick={onToggle}
      type="button"
    >
      <span aria-hidden="true" className={styles.icon}>
        {THEME_ICON[theme]}
      </span>
      <span className={styles.label}>{THEME_LABEL[theme]}</span>
    </button>
  )
}
