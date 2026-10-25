import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: Array<'resident' | 'watchman' | 'admin' | 'superadmin'>
}

/**
 * Navigation-only wrapper. Authentication has been removed, so every route
 * renders directly while keeping this component API compatible with existing pages.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>
}
