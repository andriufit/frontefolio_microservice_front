import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(data => setUser(data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    const me = await api.get('/auth/me')
    setUser(me)
    return me
  }

  async function register(formData) {
    const data = await api.post('/auth/register', formData)
    localStorage.setItem('token', data.token)
    const me = await api.get('/auth/me')
    setUser(me)
    return me
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  async function refreshUser() {
    const me = await api.get('/auth/me')
    setUser(me)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
