// จัดการ token + user ให้ทุกหน้าเข้าถึงได้
import { createContext, useContext, useState } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('token', res.data.token)
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const isLoggedIn = !!token

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)