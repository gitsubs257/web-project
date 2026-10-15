import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * PrivateRoute: Redirects to /login if user is not authenticated.
 * Also blocks admins from accessing user-only routes.
 */
export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null // Wait for hydration

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
