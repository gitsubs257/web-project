import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getAllOrdersAdmin, updateOrderStatus } from '../../services/api.js'

const ORDER_STATUSES = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Failed']

const STATUS_BADGE = {
  Processing:        'badge-yellow',
  Packed:            'badge-blue',
  Shipped:           'badge-blue',
  'Out for Delivery':'badge-blue',
  Delivered:         'badge-green',
  Cancelled:         'badge-red',
  Failed:            'badge-red',
}

export default function AdminOrders() {
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await getAllOrdersAdmin()
      setOrders(res.data)
    } catch {
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: newStatus } : o
        )
      )
      showToast(`Order status updated to "${newStatus}"`, 'success')
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filterStatus === 'All' ? orders : orders.filter((o) => o.status === filterStatus)

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">{orders.length} total orders</p>
      </div>

      {/* Status filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {['All', ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            id={`filter-order-${s.replace(/\s+/g, '-').toLowerCase()}`}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Update Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    No orders found
                  </td>
                </tr>
              )}
              {filtered.map((order) => (
                <>
                  <tr
                    key={order._id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                  >
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                        {order.user?.email}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{order.totalAmount?.toFixed(0)}</td>
                    <td>
                      <span className="badge badge-gray">{order.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {order.status === 'Processing' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleStatusChange(order._id, 'Shipped')}
                            disabled={updatingId === order._id}
                          >
                            🚚 Shipped
                          </button>
                        )}
                        {['Processing', 'Packed', 'Shipped', 'Out for Delivery'].includes(order.status) && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => handleStatusChange(order._id, 'Delivered')}
                            disabled={updatingId === order._id}
                          >
                            ✅ Delivered
                          </button>
                        )}
                        <select
                          id={`update-status-${order._id}`}
                          className="form-select"
                          style={{ fontSize: '0.8125rem', padding: '0.35rem 1.75rem 0.35rem 0.625rem', minWidth: '130px' }}
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
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                  {/* Expanded row: items detail */}
                  {expandedId === order._id && (
                    <tr key={`${order._id}-expanded`}>
                      <td colSpan={8} style={{ background: 'var(--gray-50)', padding: '1rem' }}>
                        <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          Order Items:
                        </strong>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', marginBottom: 4 }}>
                            {item.name} ({item.variantWeight}) × {item.quantity} — ₹{(item.price * item.quantity).toFixed(0)}
                          </div>
                        ))}
                        {order.shippingAddress && (
                          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--gray-600)' }}>
                            <strong>Ship to: </strong>
                            {order.shippingAddress.fullName}, {order.shippingAddress.doorNo} {order.shippingAddress.street},{' '}
                            {order.shippingAddress.city} — {order.shippingAddress.pincode}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
