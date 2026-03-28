import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem('admin_token')
  const userRaw = localStorage.getItem('admin_user')

  if (!token || !userRaw) {
    return <Navigate to="/" replace />
  }

  try {
    const user = JSON.parse(userRaw)
    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />
    }
  } catch {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    return <Navigate to="/" replace />
  }

  return children
}
