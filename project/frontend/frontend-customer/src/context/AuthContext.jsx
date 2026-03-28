import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const bootstrap = async () => {
      if (!token) {
        if (mounted) setLoading(false)
        return
      }
      try {
        const res = await authAPI.getProfile()
        if (mounted) {
          setUser(res.data.user || res.data.data || null)
        }
      } catch {
        localStorage.removeItem('token')
        if (mounted) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      mounted = false
    }
  }, [token])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user || res.data.data)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isLoggedIn: !!token,
    login,
    logout,
  }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
