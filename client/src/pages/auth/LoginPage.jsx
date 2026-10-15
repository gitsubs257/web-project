import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { login as apiLogin } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const { showToast } = useToast()

  const successMessage = location.state?.successMessage || ''

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/', { replace: true })
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    if (!form.password) errs.password = 'Password is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await apiLogin(form)
      loginUser(res.data)
      // Redirect by role
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/')
      }
      showToast(`Welcome back, ${res.data.user.firstName}!`, 'success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      showToast(msg, 'error')
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/logo.png"
            alt="NTC Logo"
            style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gold)', marginBottom: '0.6rem', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
          />
          <h1>Nethaji Tea</h1>
          <p>Premium Teas Since 1985</p>
        </div>

        {successMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            ✓ {successMessage}
          </div>
        )}

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>

        {errors.general && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {errors.general}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => { setForm((p) => ({ ...p, email: e.target.value })); setErrors({}) }}
              autoComplete="email"
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              className={`form-input${errors.password ? ' error' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => { setForm((p) => ({ ...p, password: e.target.value })); setErrors({}) }}
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', marginTop: '0.25rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" id="go-to-register">Create one</Link>
        </div>
      </div>
    </div>
  )
}
