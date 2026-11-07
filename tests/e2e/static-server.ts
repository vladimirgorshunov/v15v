import { readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'

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
  `${readFileSync(new URL('../../infrastructure/cloudfront-navigation.js', import.meta.url), 'utf8')}\nhandler`,
) as (event: { request: EdgeRequest }) => EdgeRequest | EdgeResponse

Bun.serve({
  hostname: '127.0.0.1',
  port: 4173,
  async fetch(request) {
    const url = new URL(request.url)
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
      return new Response(null, {
        status: result.statusCode,
        headers: Object.fromEntries(
          Object.entries(result.headers).map(([name, header]) => [
            name,
            header.value,
          ]),
        ),
      })
    }

    let key: string
    try {
      key = decodeURIComponent(result.uri).replace(/^\/+/, '')
    } catch {
      return new Response('Bad request', { status: 400 })
    }
    const filePath = resolve(publicDir, key)
    const relativePath = relative(publicDir, filePath)
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      return new Response('Forbidden', { status: 403 })
    }
    const file = Bun.file(filePath)
    return (await file.exists())
      ? new Response(file)
      : new Response('Not found', { status: 404 })
  },
})
