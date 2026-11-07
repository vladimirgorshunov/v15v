import { describe, expect, test } from 'bun:test'
import { PortableText } from '@portabletext/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { portableTextComponents } from '@/components/blog/portableTextComponents'
import type { PortableTextBlock } from '@portabletext/react'

const listItem = (text: string, level: number): PortableTextBlock => ({
  _type: 'block',
  _key: text,
  style: 'normal',
  listItem: 'number',
  level,
  markDefs: [],
  children: [{ _type: 'span', _key: `${text}-span`, text, marks: [] }],
})

describe('Portable Text rendering', () => {
  test('renders the existing image, callout, code and link components', () => {
    const html = renderToStaticMarkup(
      <PortableText
        components={portableTextComponents}
        value={[
          {
            _type: 'block',
            _key: 'paragraph',
            style: 'normal',
            markDefs: [
              { _type: 'link', _key: 'link', href: 'https://example.com' },
            ],
            children: [
              {
                _type: 'span',
                _key: 'span',
                text: 'Reference',
                marks: ['link'],
              },
            ],
          },
          {
            _type: 'image',
            _key: 'image',
            url: '/static/fixture.jpg',
            alt: 'Fixture image',
            caption: 'Image caption',
          },
          {
            _type: 'callout',
            _key: 'callout',
            tone: 'warning',
            text: 'Take care',
          },
          {
            _type: 'codeBlock',
            _key: 'code',
            language: 'typescript',
            code: 'const answer = 42',
          },
        ]}
      />,
    )

    expect(html).toContain('href="https://example.com"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).toContain('target="_blank"')
    expect(html).toContain('alt="Fixture image"')
    expect(html).toContain('src="/static/fixture.jpg"')
    expect(html).toContain('Image caption</figcaption>')
    expect(html).toContain('Take care</aside>')
    expect(html).toContain('<code>const answer = 42</code>')
  })

  test('keeps the unsupported block fallback and omits images without a URL', () => {
    const html = renderToStaticMarkup(
      <PortableText
        components={portableTextComponents}
        value={[
          { _type: 'unknownFixture', _key: 'unknown' },
          { _type: 'image', _key: 'image', alt: 'Missing image' },
        ]}
      />,
    )

    expect(html).toContain('Unsupported Sanity block type:')
    expect(html).toContain('<code>unknownFixture</code>')
    expect(html).not.toContain('<img')
  })

  test('preserves actual depth and the parent list when content starts deep', () => {
    const html = renderToStaticMarkup(
      <PortableText value={[listItem('Deep', 3), listItem('Top', 1)]} />,
    )

    expect(html).toBe(
      '<ol><li><ol><li><ol><li>Deep</li></ol></li></ol></li><li>Top</li></ol>',
    )
  })

  test('fills skipped list levels and resumes the existing ordered list', () => {
    const html = renderToStaticMarkup(
      <PortableText
        value={[
          listItem('First', 1),
          listItem('Deep', 3),
          listItem('Second', 1),
        ]}
      />,
    )

    expect(html).toBe(
      '<ol><li>First<ol><li><ol><li>Deep</li></ol></li></ol></li><li>Second</li></ol>',
    )
  })
})
