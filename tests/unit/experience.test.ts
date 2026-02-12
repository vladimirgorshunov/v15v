import { describe, expect, test } from 'bun:test'

import {
  CAREER_START_TIMESTAMP_MS,
  YEAR_IN_MS,
  calculateYearsOfExperience,
} from '@/lib/experience'

describe('calculateYearsOfExperience', () => {
  test('returns 0 before one full year has passed', () => {
    const now = CAREER_START_TIMESTAMP_MS + YEAR_IN_MS - 1

    expect(calculateYearsOfExperience(now)).toBe(0)
  })

  test('returns an integer number of years since the career start timestamp', () => {
    const now = CAREER_START_TIMESTAMP_MS + YEAR_IN_MS * 7 + 12345

    expect(calculateYearsOfExperience(now)).toBe(7)
  })
})
