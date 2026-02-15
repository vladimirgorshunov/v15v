import { expect, test } from '@playwright/test'

test('loads primary about content from /', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByText('I am a web-developer with', { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'here' })).toHaveAttribute(
    'href',
    '/static/CV.pdf',
  )
})

test('redirects /about alias to /', async ({ page }) => {
  await page.goto('/about')

  await expect(page).toHaveURL(/\/$/)
  await expect(
    page.getByText('I am a web-developer with', { exact: false }),
  ).toBeVisible()
})

test('redirects unknown routes to /404', async ({ page }) => {
  await page.goto('/does-not-exist')

  await expect(page).toHaveURL(/\/404$/)
  await expect(page.getByText('CDIV')).toBeVisible()
  await expect(page.getByText('Try another page.')).toBeVisible()
})

test('renders blog root and sanity setup state', async ({ page }) => {
  await page.goto('/blog')

  await expect(page).toHaveURL(/\/blog$/)
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible()
  await expect(page.getByText('Sanity is not configured yet.')).toBeVisible()
})

test('serves static asset URLs', async ({ request }) => {
  const cvResponse = await request.get('/static/CV.pdf')
  expect(cvResponse.ok()).toBeTruthy()

  const cvContentType = cvResponse.headers()['content-type'] ?? ''
  expect(cvContentType.toLowerCase()).toContain('pdf')

  const manifestResponse = await request.get('/static/manifest.json')
  expect(manifestResponse.ok()).toBeTruthy()

  const iconResponse = await request.get('/static/img/icons/favicon-32x32.png')
  expect(iconResponse.ok()).toBeTruthy()
})
