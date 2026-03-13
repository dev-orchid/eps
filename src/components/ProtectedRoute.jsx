import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner message="Checking authentication..." />
  if (!user) return <Navigate to="/signin" replace />
  return <Outlet />
}
