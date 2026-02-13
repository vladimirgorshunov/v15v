import styles from './portableTextComponents.module.css'
import type { PortableTextComponents } from '@portabletext/react'

type PortableImageValue = {
  alt?: string
  caption?: string
  url?: string
}

type PortableCalloutValue = {
  text?: string
  tone?: 'info' | 'warning' | 'success'
}

type PortableCodeBlockValue = {
  code?: string
  language?: string
}

export const portableTextComponents: PortableTextComponents = {
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === 'string' ? value.href : '#'
      const isExternal = /^https?:\/\//.test(href)

      return (
        <a
          className={styles.link}
          href={href}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          target={isExternal ? '_blank' : undefined}
        >
          {children}
        </a>
      )
    },
  },
  types: {
    callout: ({ value }) => {
      const callout = value as PortableCalloutValue
      const tone = callout.tone ?? 'info'

      return (
        <aside className={`${styles.callout} ${styles[`callout${tone}`]}`}>
          {callout.text ?? ''}
        </aside>
      )
    },
    codeBlock: ({ value }) => {
      const codeValue = value as PortableCodeBlockValue

      return (
        <figure className={styles.codeBlock}>
          {codeValue.language ? (
            <figcaption className={styles.codeLanguage}>
              {codeValue.language}
            </figcaption>
          ) : null}
          <pre>
            <code>{codeValue.code ?? ''}</code>
          </pre>
        </figure>
      )
    },
    image: ({ value }) => {
      const imageValue = value as PortableImageValue

      if (!imageValue.url) {
        return null
      }

      return (
        <figure className={styles.imageBlock}>
          <img alt={imageValue.alt ?? ''} src={imageValue.url} />
          {imageValue.caption ? (
            <figcaption className={styles.imageCaption}>
              {imageValue.caption}
            </figcaption>
          ) : null}
        </figure>
      )
    },
  },
  unknownType: ({ value }) => {
    const typeName =
      typeof value === 'object' && '_type' in value ? String(value._type) : 'unknown'

    return (
      <div className={styles.unsupportedBlock}>
        Unsupported Sanity block type: <code>{typeName}</code>
      </div>
    )
  },
}
