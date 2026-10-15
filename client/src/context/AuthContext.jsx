import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('ntc_token')
    const storedUser  = localStorage.getItem('ntc_user')
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('ntc_token')
        localStorage.removeItem('ntc_user')
      }
    }
    setLoading(false)
  }, [])

  /** Call after a successful login API response */
  const loginUser = useCallback(({ token: tok, user: u }) => {
    setToken(tok)
    setUser(u)
    localStorage.setItem('ntc_token', tok)
    localStorage.setItem('ntc_user', JSON.stringify(u))
  }, [])

  /** Clear auth state and redirect to login */
  const logoutUser = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('ntc_token')
    localStorage.removeItem('ntc_user')
  }, [])

  /** Update stored user profile (e.g. after profile edit) */
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('ntc_user', JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        loginUser,
        logoutUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
