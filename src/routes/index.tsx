import { createFileRoute } from '@tanstack/react-router'

import { AboutContent } from '@/components/AboutContent'

const HomeRoute = () => {
  return (
    <main>
      <AboutContent />
    </main>
  )
}

export const Route = createFileRoute('/')({
  component: HomeRoute,
})
