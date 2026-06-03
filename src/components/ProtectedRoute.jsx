import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../lib/store'

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
