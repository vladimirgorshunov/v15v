import { readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { invokeLambdaHandler } from 'srvx/aws-lambda'

type EdgeQueryValue = { value: string; multiValue?: Array<{ value: string }> }
type EdgeRequest = {
  uri: string
  querystring: Partial<Record<string, EdgeQueryValue>>
}
type EdgeResponse = {
  statusCode: number
  headers: Record<string, { value: string }>
}

const publicDir = fileURLToPath(new URL('../../.output/public/', import.meta.url))
const routeRequest = runInNewContext(
  `${readFileSync(new URL('../../infrastructure/cloudfront-about-redirect.js', import.meta.url), 'utf8')}\nhandler`,
) as (event: { request: EdgeRequest }) => EdgeRequest | EdgeResponse

// Nitro replaces globalThis.Response while loading its Node Lambda entry.
const NativeResponse = globalThis.Response
// Generated only by the build; it is absent during source-only typechecking.
const { handler } = (await import(
  new URL('../../.output/server/index.mjs', import.meta.url).href
)) as { handler: Parameters<typeof invokeLambdaHandler>[0] }

const isS3Path = (pathname: string) =>
  pathname.startsWith('/assets/') ||
  pathname.startsWith('/static/') ||
  pathname === '/favicon.ico' ||
  pathname === '/robots.txt'

Bun.serve({
  hostname: '127.0.0.1',
  port: 4173,
  async fetch(request) {
    const url = new URL(request.url)
    if (isS3Path(url.pathname)) {
      let key: string
      try {
        key = decodeURIComponent(url.pathname).replace(/^\/+/, '')
      } catch {
        return new NativeResponse('Bad request', { status: 400 })
      }
      const filePath = resolve(publicDir, key)
      const relativePath = relative(publicDir, filePath)
      if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
        return new NativeResponse('Forbidden', { status: 403 })
      }
      const file = Bun.file(filePath)
      return (await file.exists())
        ? new NativeResponse(file)
        : new NativeResponse('Not found', { status: 404 })
    }
    const querystring = Object.create(null) as Partial<
      Record<string, EdgeQueryValue>
    >
    for (const pair of url.search.slice(1).split('&').filter(Boolean)) {
      const separator = pair.indexOf('=')
      const key = separator < 0 ? pair : pair.slice(0, separator)
      const value = separator < 0 ? '' : pair.slice(separator + 1)
      const existing = querystring[key]
      if (existing) {
        existing.multiValue ??= [{ value: existing.value }]
        existing.multiValue.push({ value })
      } else {
        querystring[key] = { value }
      }
    }
    const result = routeRequest({ request: { uri: url.pathname, querystring } })
    if ('statusCode' in result) {
      return new NativeResponse(null, {
        status: result.statusCode,
        headers: Object.fromEntries(
          Object.entries(result.headers).map(([name, header]) => [
            name,
            header.value,
          ]),
        ),
      })
    }

    const response = await invokeLambdaHandler(handler, request)
    // srvx returns a NodeResponse; Bun.serve requires a native Response.
    return new NativeResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  },
})
