import { createFileRoute } from '@tanstack/react-router'

import { AboutContent } from '@/components/AboutContent'

const AboutRoute = () => {
  return (
    <main>
      <AboutContent />
    </main>
  )
}

export const Route = createFileRoute('/about')({
  component: AboutRoute,
})
