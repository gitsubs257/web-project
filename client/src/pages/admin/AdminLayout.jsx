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
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="/logo.png"
            alt="NTC Logo"
            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold)', background: 'white' }}
          />
          <div>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Nethaji Tea</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.7 }}>Admin Dashboard</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            id="admin-nav-store"
            className="sidebar-nav-item"
            style={{ marginBottom: '0.5rem', opacity: 0.8 }}
          >
            <span style={{ fontSize: '1.1rem' }}>🏪</span>
            View Store
          </NavLink>
          {NAV_ITEMS.map(({ to, label, emoji, isCancellation }) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              id={`admin-nav-${to}`}
              className={({ isActive }) =>
                `sidebar-nav-item${isActive ? ' active' : ''}`
              }
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

        {/* Admin info + logout at bottom */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
            Logged in as
          </div>
          <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <button
            id="admin-logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 'var(--radius-md)',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
