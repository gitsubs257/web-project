import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'

// SVG Icon helpers
const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
)
const AccountIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)
const OrdersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
    <rect x="9" y="3" width="6" height="4" rx="1"/>
    <path d="M9 12h6M9 16h4"/>
  </svg>
)
const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)

export default function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <img
            src="/logo.png"
            alt="NTC Logo"
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold)' }}
          />
          <span>Nethaji <span>Tea</span></span>
        </Link>

        {/* Navigation links */}
        <div className="navbar-nav-links">
          <Link
            to="/"
            id="nav-home"
            className={`nav-icon-btn${isActive('/') ? ' active' : ''}`}
            aria-label="Home"
          >
            <HomeIcon />
            <span>Home</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                id="nav-orders"
                className={`nav-icon-btn${isActive('/orders') ? ' active' : ''}`}
                aria-label="Orders"
              >
                <OrdersIcon />
                <span>Orders</span>
              </Link>
              <Link
                to="/account"
                id="nav-account"
                className={`nav-icon-btn${isActive('/account') ? ' active' : ''}`}
                aria-label="Account"
              >
                <AccountIcon />
                <span>Account</span>
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  id="nav-admin"
                  className={`nav-icon-btn admin-pill${location.pathname.startsWith('/admin') ? ' active' : ''}`}
                  aria-label="Admin Dashboard"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                  </svg>
                  <span>Admin</span>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right side: Cart and Auth */}
        <div className="navbar-right">
          {!isAuthenticated ? (
            <Link to="/login" id="nav-login-btn" className="btn btn-primary btn-sm">
              Login
            </Link>
          ) : (
            <button
              id="nav-cart-btn"
              className="cart-btn"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${cartCount} items`}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="cart-badge" aria-live="polite">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
