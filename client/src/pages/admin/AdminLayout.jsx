import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getOrderStats } from '../../services/api.js'

const NAV_ITEMS = [
  { to: 'dashboard',     label: 'Dashboard',             emoji: '📊' },
  { to: 'products',      label: 'Products',              emoji: '🍃' },
  { to: 'orders',        label: 'Orders',                emoji: '📦' },
  { to: 'cancellations', label: 'Cancellations',         emoji: '⚠️', isCancellation: true },
  { to: 'coupons',       label: 'Coupons',               emoji: '🏷️' },
]

export default function AdminLayout() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getOrderStats()
        if (res.data?.pendingCancellations) {
          setPendingCount(res.data.pendingCancellations)
        }
      } catch {
        // ignore
      }
    }
    fetchPending()
  }, [])

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" aria-label="Admin navigation">
        {/* Mobile top bar toggle */}
        <div className="admin-sidebar-mobile-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img
              src="/logo.png"
              alt="NTC Logo"
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold)', background: 'white' }}
            />
            <div>
              <div style={{ color: '#ffffff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', lineHeight: 1 }}>
                Nethaji Admin
              </div>
              <div style={{ fontSize: '0.7rem', color: '#fef08a' }}>Assam Tea Co.</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {pendingCount > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                {pendingCount} Alert{pendingCount > 1 ? 's' : ''}
              </span>
            )}
            <button
              id="admin-mobile-menu-btn"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              aria-label="Toggle admin menu"
            >
              {mobileDrawerOpen ? '✕ Close' : '☰ Menu'}
            </button>
          </div>
        </div>

        {/* Desktop Sidebar Logo (Hidden on mobile by CSS) */}
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="NTC Logo"
            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold)', background: 'white' }}
          />
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, fontFamily: 'var(--font-display)', fontWeight: 800 }}>Nethaji Tea</h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#fef08a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assam Tea Master</p>
          </div>
        </div>

        {/* Sidebar Nav & Drawer for Mobile */}
        <div className={`admin-sidebar-drawer ${mobileDrawerOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              id="admin-nav-store"
              className="sidebar-nav-item"
              onClick={() => setMobileDrawerOpen(false)}
              style={{ marginBottom: '0.5rem', color: '#fef08a' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🏪</span>
                <span style={{ fontWeight: 600 }}>← Back to Store</span>
              </div>
            </NavLink>

            {NAV_ITEMS.map(({ to, label, emoji, isCancellation }) => (
              <NavLink
                key={to}
                to={`/admin/${to}`}
                id={`admin-nav-${to}`}
                className={({ isActive }) =>
                  `sidebar-nav-item${isActive ? ' active' : ''}`
                }
                onClick={() => setMobileDrawerOpen(false)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                  <span>{label}</span>
                </div>
                {isCancellation && pendingCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.125rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Admin info + logout */}
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administrator
            </div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '0.55rem',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: 'var(--radius-md)',
                color: '#fca5a5',
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
