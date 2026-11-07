import { createFileRoute } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { setResponseStatus } from '@tanstack/react-start/server'

import { PageNotFound } from '@/components/PageNotFound'

const markNotFound = createIsomorphicFn().server(() => {
  setResponseStatus(404)
})

const NotFoundRoute = () => {
  return (
    <main>
      <PageNotFound />
    </main>
  )
}

export const Route = createFileRoute('/404')({
  loader: () => {
    markNotFound()
  },
  component: NotFoundRoute,
})
