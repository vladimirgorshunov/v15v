import { Navigate, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: RootRedirectRoute,
})

function RootRedirectRoute() {
  return <Navigate replace to="/about" />
}
