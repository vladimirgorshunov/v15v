export const CAREER_START_TIMESTAMP_MS = 1346533200000
export const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365

export function calculateYearsOfExperience(now = Date.now()): number {
  return Math.floor((now - CAREER_START_TIMESTAMP_MS) / YEAR_IN_MS)
}
