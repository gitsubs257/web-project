import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { checkEmail, register } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

/**
 * Multi-step Registration:
 *   Step 1: Enter email → check if already registered
 *   Step 2: Enter firstName, lastName, password, confirmPassword
 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { isAuthenticated, isAdmin, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(isAdmin ? '/admin/dashboard' : '/', { replace: true })
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate])

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  const [form, setForm] = useState({ firstName: '', lastName: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // ── Step 1: Check email ────────────────────────────────────────────────────
  const handleCheckEmail = async (e) => {
    e.preventDefault()
    setEmailError('')
    setEmailExists(false)

    if (!email.trim()) { setEmailError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Enter a valid email address'); return }

    setCheckingEmail(true)
    try {
      const res = await checkEmail(email.trim())
      if (res.data.exists) {
        setEmailExists(true)
        setEmailError('') // handled below via emailExists flag
      } else {
        setStep(2)
      }
    } catch {
      setEmailError('Failed to check email. Please try again.')
    } finally {
      setCheckingEmail(false)
    }
  }

  // ── Step 2: Register ───────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim())  errs.lastName  = 'Last name is required'
    if (!form.password)         errs.password  = 'Password is required'
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!form.confirmPassword)  errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({ ...form, email: email.trim() })
      showToast('Registration successful! Please login.', 'success')
      navigate('/login', { state: { successMessage: 'Account created! Please login.' } })
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      setErrors({ general: msg })
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const setField = (name) => (e) => {
    setForm((p) => ({ ...p, [name]: e.target.value }))
    setErrors((p) => ({ ...p, [name]: '' }))
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
          <p>Create your account</p>
        </div>

        {/* Step indicator */}
        <div className="step-indicator" style={{ marginBottom: '1.75rem' }}>
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`}>
            <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
            <span className="step-label">Email</span>
          </div>
          <div className={`step-line ${step > 1 ? 'done' : ''}`} />
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-circle">2</div>
            <span className="step-label">Details</span>
          </div>
        </div>

        {/* ── Step 1 ─────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 className="auth-title">Enter your Email</h2>
            <p className="auth-subtitle">We'll check if you already have an account.</p>

            <form className="auth-form" onSubmit={handleCheckEmail} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className={`form-input${emailError ? ' error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); setEmailExists(false) }}
                  autoComplete="email"
                />
                {emailError && <span className="form-error">{emailError}</span>}
              </div>

              {emailExists && (
                <div className="alert alert-warning">
                  ⚠️ This email is already registered.{' '}
                  <Link to="/login" style={{ fontWeight: 700, color: 'var(--brown)' }}>Login instead</Link>
                </div>
              )}

              <button
                id="check-email-btn"
                type="submit"
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
                disabled={checkingEmail}
              >
                {checkingEmail ? 'Checking...' : 'Continue →'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" id="go-to-login">Sign In</Link>
            </div>
          </>
        )}

        {/* ── Step 2 ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 className="auth-title">Your Details</h2>
            <p className="auth-subtitle">
              Creating account for <strong>{email}</strong>{' '}
              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: '0.125rem 0.375rem', fontSize: '0.75rem', color: 'var(--tea-green)' }}
                onClick={() => setStep(1)}
              >
                Change
              </button>
            </p>

            {errors.general && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                {errors.general}
              </div>
            )}

            <form className="auth-form" onSubmit={handleRegister} noValidate>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-first">First Name</label>
                  <input
                    id="reg-first"
                    className={`form-input${errors.firstName ? ' error' : ''}`}
                    placeholder="Ravi"
                    value={form.firstName}
                    onChange={setField('firstName')}
                  />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-last">Last Name</label>
                  <input
                    id="reg-last"
                    className={`form-input${errors.lastName ? ' error' : ''}`}
                    placeholder="Kumar"
                    value={form.lastName}
                    onChange={setField('lastName')}
                  />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={setField('password')}
                  autoComplete="new-password"
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
                <input
                  id="reg-confirm"
                  type="password"
                  className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className="btn btn-primary w-full"
                style={{ justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{' '}
              <Link to="/login">Sign In</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
