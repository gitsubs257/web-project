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
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-subtitle">Welcome to Nethaji Tea Company admin panel</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">🍃</div>
          <div>
            <div className="stat-value">{productCount}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon brown">📦</div>
          <div>
            <div className="stat-value">{stats?.totalOrders ?? 0}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-value">—</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">💰</div>
          <div>
            <div className="stat-value">₹—</div>
            <div className="stat-label">Revenue</div>
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
