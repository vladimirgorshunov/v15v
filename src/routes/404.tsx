import { createFileRoute } from '@tanstack/react-router'

import { PageNotFound } from '@/components/PageNotFound'

export const Route = createFileRoute('/404')({
  component: NotFoundRoute,
})

function NotFoundRoute() {
  return (
    <main>
      <PageNotFound />
    </main>
  )
}
