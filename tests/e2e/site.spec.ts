import { expect, test } from '@playwright/test'

test('redirects / to /about and renders primary content', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/about$/)
  await expect(
    page.getByText('I am a web-developer with', { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'here' })).toHaveAttribute(
    'href',
    '/static/CV.pdf',
  )
})

test('redirects unknown routes to /404', async ({ page }) => {
  await page.goto('/does-not-exist')

  await expect(page).toHaveURL(/\/404$/)
  await expect(page.getByText('CDIV')).toBeVisible()
  await expect(page.getByText('Try another page.')).toBeVisible()
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
