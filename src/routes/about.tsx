import { createFileRoute } from '@tanstack/react-router'

import { AboutContent } from '@/components/AboutContent'

export const Route = createFileRoute('/about')({
  component: AboutRoute,
})

function AboutRoute() {
  return (
    <main>
      <AboutContent />
    </main>
  )
}
