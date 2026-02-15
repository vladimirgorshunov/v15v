import { describe, expect, test } from 'bun:test'

import { CONTACT_LINKS, CV_URL } from '@/content/siteContent'

describe('site content', () => {
  test('keeps the CV URL parity contract', () => {
    expect(CV_URL).toBe('/static/CV.pdf')
  })

  test('contains all expected contact links', () => {
    expect(CONTACT_LINKS).toHaveLength(4)

    expect(CONTACT_LINKS.map((link) => link.text)).toEqual([
      'Github',
      'Telegram',
      'LinkedIn',
      'Mail',
    ])
  })
})
