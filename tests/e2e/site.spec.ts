import { expect, test } from '@playwright/test'

test.beforeEach(({ page }) => {
  page.on('pageerror', (error) => {
    throw error
  })
  page.on('console', (message) => {
    if (message.type() === 'error') {
      expect(message.text()).not.toMatch(/hydrat|Minified React error/i)
    }
  })
})

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

test('loads the /404 page directly', async ({ page }) => {
  await page.goto('/404')

  await expect(page).toHaveURL(/\/404$/)
  await expect(page.getByText('Try another page.')).toBeVisible()
})

test('renders blog root and sanity setup state', async ({ page }) => {
  await page.goto('/blog')

  await expect(page).toHaveURL(/\/blog$/)
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible()
  await expect(page.getByText('Sanity is not configured yet.')).toBeVisible()

  await page.reload()
  await expect(page).toHaveURL(/\/blog$/)
  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible()
  await expect(page.getByText('Sanity is not configured yet.')).toBeVisible()
})

test('redirects missing blog posts to /404', async ({ page }) => {
  await page.goto('/blog/missing-post')

  await expect(page).toHaveURL(/\/404$/)
  await expect(page.getByText('Try another page.')).toBeVisible()
})

test('preserves the selected theme after a fresh page load', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(
    page.getByRole('button', { name: 'Switch to light theme' }),
  ).toBeVisible()
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

test('preserves failures for missing static assets', async ({ request }) => {
  for (const path of [
    '/assets/does-not-exist.js',
    '/static/does-not-exist.pdf',
  ]) {
    const response = await request.get(path)
    expect(response.ok()).toBeFalsy()
    expect(response.headers()['content-type']).not.toContain('text/html')
  }
})

test('responds 404 for the /404 page', async ({ request }) => {
  const response = await request.get('/404')
  expect(response.status()).toBe(404)
  expect(await response.text()).toContain('Try another page.')
})

test('redirects unknown and missing routes to /404 on the server', async ({
  request,
}) => {
  for (const path of ['/does-not-exist', '/blog/missing-post']) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(307)
    expect(response.headers()['location']).toBe('/404')
  }
})

test('preserves query on the /about edge redirect', async ({ request }) => {
  const response = await request.get('/about?x=1', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers()['location']).toBe('/?x=1')
})

test('server-renders page content without JavaScript', async ({ request }) => {
  const home = await request.get('/')
  expect(home.status()).toBe(200)
  expect(home.headers()['content-type']).toContain('text/html')
  expect(home.headers()['cache-control']).toBe('no-cache')
  const html = await home.text()
  expect(html).toContain('I am a web-developer with')
  expect(html).toContain('href="/blog"')

  const blog = await request.get('/blog')
  expect(blog.status()).toBe(200)
  expect(await blog.text()).toContain('Sanity is not configured yet.')
})
