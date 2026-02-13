import { createFileRoute } from '@tanstack/react-router'

import { PageNotFound } from '@/components/PageNotFound'

const NotFoundRoute = () => {
  return (
    <main>
      <PageNotFound />
    </main>
  )
}

export const Route = createFileRoute('/404')({
  component: NotFoundRoute,
})
