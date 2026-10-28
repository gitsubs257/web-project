import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getProducts, getOrderStats, updateOrderStatus } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const ORDER_STATUSES = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']

export default function AdminDashboard() {
  const { showToast } = useToast()
  const [stats, setStats] = useState(null)
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setStats((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          recentOrders: prev.recentOrders.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          ),
        }
      })
      showToast(`Order updated to "${newStatus}"`, 'success')
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, prodRes] = await Promise.all([getOrderStats(), getProducts()])
        setStats(statsRes.data)
        setProductCount(prodRes.data.length)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const STATUS_BADGE = {
    Processing:       'badge-yellow',
    Packed:           'badge-blue',
    Shipped:          'badge-blue',
    'Out for Delivery':'badge-blue',
    Delivered:        'badge-green',
    Cancelled:        'badge-red',
    Failed:           'badge-red',
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title" style={{ fontFamily: 'var(--font-display)', color: 'var(--tea-deep)' }}>
          Estate Operations Dashboard
        </h1>
        <p className="admin-page-subtitle" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1rem' }}>
          Real-time analytics for Nethaji Upper Assam Tea harvests, orders & customer accounts
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="admin-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Blends
            </span>
            <span style={{ fontSize: '1.5rem' }}>🍃</span>
          </div>
          <div className="admin-metric-value">{productCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--tea-green)', marginTop: 4, fontWeight: 600 }}>
            Assam Single-Origin Teas
          </div>
        </div>

        <div className="admin-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Orders
            </span>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
          </div>
          <div className="admin-metric-value">{stats?.totalOrders ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--brown)', marginTop: 4, fontWeight: 600 }}>
            Direct Dispatches
          </div>
        </div>

        <div className="admin-metric-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tea Connoisseurs
            </span>
            <span style={{ fontSize: '1.5rem' }}>👥</span>
          </div>
          <div className="admin-metric-value">{stats?.totalUsers ?? 0}</div>
          <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: 4, fontWeight: 600 }}>
            Registered Customers
          </div>
        </div>

        <div className="admin-metric-card" style={{ border: '1.5px solid var(--gold-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Revenue
            </span>
            <span style={{ fontSize: '1.5rem' }}>💰</span>
          </div>
          <div className="admin-metric-value" style={{ color: 'var(--brown-dark)' }}>
            ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gold)', marginTop: 4, fontWeight: 700 }}>
            Gross Tea Sales
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--gray-800)' }}>
          Recent Orders
        </h2>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Current Status</th>
                <th>Update Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem' }}>
                    No orders yet
                  </td>
                </tr>
              )}
              {stats?.recentOrders?.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #{order._id.slice(-8)}
                    </span>
                  </td>
                  <td>{order.user?.firstName} {order.user?.lastName}</td>
                  <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toFixed(0)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {order.status === 'Processing' && (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleStatusChange(order._id, 'Shipped')}
                          disabled={updatingId === order._id}
                        >
                          🚚 Mark Shipped
                        </button>
                      )}
                      {(order.status === 'Processing' || order.status === 'Packed' || order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                          onClick={() => handleStatusChange(order._id, 'Delivered')}
                          disabled={updatingId === order._id}
                        >
                          ✅ Mark Delivered
                        </button>
                      )}
                      <select
                        id={`dash-update-status-${order._id}`}
                        className="form-select"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 1.75rem 0.25rem 0.5rem', minWidth: '120px' }}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
