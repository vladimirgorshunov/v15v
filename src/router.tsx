import { createRouter as createTanStackRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

// Start expects this entry and creates a new router per request.
export const getRouter = () => {
  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
  })
}
