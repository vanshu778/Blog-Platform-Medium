import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      if (!stored) return null
      const parsed = JSON.parse(stored)
      // Detect old-format stored value (had `token` or `accessToken` at top level)
      // Valid new format only has user fields like _id, name, email, username
      if (parsed?.token || parsed?.accessToken || !parsed?.username) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        return null
      }
      return parsed
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    localStorage.setItem('token', userData.accessToken)
    localStorage.setItem('user', JSON.stringify(userData.user))
    setUser(userData.user)
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {}) // clear refresh cookie on server
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (partialData) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialData }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
