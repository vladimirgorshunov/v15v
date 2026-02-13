import { Navigate, createFileRoute } from '@tanstack/react-router'

const RootRedirectRoute = () => {
  return <Navigate replace to="/about" />
}

export const Route = createFileRoute('/')({
  component: RootRedirectRoute,
})
