import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getCancellationRequests, reviewCancellationRequest } from '../../services/api.js'

export default function AdminCancellations() {
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('Pending') // 'Pending' | 'Approved' | 'Rejected' | 'All'
  const [processingId, setProcessingId] = useState(null)
  const [rejectModalOrder, setRejectModalOrder] = useState(null)
  const [rejectComment, setRejectComment] = useState('')

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const res = await getCancellationRequests()
      setRequests(res.data)
    } catch {
      showToast('Failed to load cancellation requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this cancellation request? The order will be cancelled and item stock restored.')) return

    setProcessingId(orderId)
    try {
      const res = await reviewCancellationRequest(orderId, { action: 'approve' })
      setRequests((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.order : o))
      )
      showToast('Cancellation approved. Order is now cancelled.', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to approve cancellation', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectSubmit = async (e) => {
    e.preventDefault()
    if (!rejectModalOrder) return

    setProcessingId(rejectModalOrder._id)
    try {
      const res = await reviewCancellationRequest(rejectModalOrder._id, {
        action: 'reject',
        comment: rejectComment.trim() || 'Rejected by admin: order is already in fulfillment.',
      })
      setRequests((prev) =>
        prev.map((o) => (o._id === rejectModalOrder._id ? res.data.order : o))
      )
      showToast('Cancellation request rejected. Order remains active.', 'info')
      setRejectModalOrder(null)
      setRejectComment('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject cancellation', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const pendingList = requests.filter((r) => r.cancellationRequest?.status === 'Pending')
  const approvedList = requests.filter((r) => r.cancellationRequest?.status === 'Approved')
  const rejectedList = requests.filter((r) => r.cancellationRequest?.status === 'Rejected')

  const displayList =
    tab === 'Pending'  ? pendingList
    : tab === 'Approved' ? approvedList
    : tab === 'Rejected' ? rejectedList
    : requests

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>⚠️</span> Cancellation Requests
            {pendingList.length > 0 && (
              <span style={{ fontSize: '0.85rem', background: '#ef4444', color: '#fff', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                {pendingList.length} Pending
              </span>
            )}
          </h1>
          <p className="admin-page-subtitle">
            Customer requested order cancellations. Approve to restock & cancel, or reject to continue processing.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={fetchRequests} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button
          className={`btn btn-sm ${tab === 'Pending' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('Pending')}
        >
          Pending ({pendingList.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'Approved' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('Approved')}
        >
          Approved ({approvedList.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'Rejected' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('Rejected')}
        >
          Rejected ({rejectedList.length})
        </button>
        <button
          className={`btn btn-sm ${tab === 'All' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setTab('All')}
        >
          All Requests ({requests.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : displayList.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '0.25rem' }}>
            No {tab} Cancellation Requests
          </h3>
          <p style={{ fontSize: '0.875rem' }}>
            {tab === 'Pending'
              ? 'Great news! There are no pending cancellation requests waiting for review.'
              : `There are currently no ${tab.toLowerCase()} cancellation requests.`}
          </p>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items & Total</th>
                <th>Order Status</th>
                <th>Reason for Cancellation</th>
                <th>Requested At</th>
                <th>Review Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map((order) => {
                const reqData = order.cancellationRequest || {}
                const isPending = reqData.status === 'Pending'

                return (
                  <tr key={order._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                        #{order._id.slice(-8)}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.user?.firstName} {order.user?.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {order.user?.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        📞 {order.shippingAddress?.phone || order.user?.phone || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>₹{order.totalAmount?.toFixed(0)}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                        {order.items?.map((it) => `${it.name} (${it.variantWeight}) × ${it.quantity}`).join(', ')}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{order.status}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: '0.85rem' }}>
                        {reqData.reason || 'Not specified'}
                      </div>
                      {reqData.otherReason && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginTop: 2, fontStyle: 'italic' }}>
                          "{reqData.otherReason}"
                        </div>
                      )}
                      {reqData.adminComment && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: 4 }}>
                          <strong>Admin Note:</strong> {reqData.adminComment}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {reqData.requestedAt ? new Date(reqData.requestedAt).toLocaleString('en-IN') : '—'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          reqData.status === 'Approved' ? 'badge-red'
                          : reqData.status === 'Rejected' ? 'badge-green'
                          : 'badge-yellow'
                        }`}
                      >
                        {reqData.status === 'Pending' ? '⏳ Pending Review'
                         : reqData.status === 'Approved' ? '✓ Approved (Cancelled)'
                         : '✕ Rejected'}
                      </span>
                    </td>
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem', background: '#dc2626', borderColor: '#dc2626' }}
                            onClick={() => handleApprove(order._id)}
                            disabled={processingId === order._id}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                            onClick={() => {
                              setRejectModalOrder(order)
                              setRejectComment('')
                            }}
                            disabled={processingId === order._id}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setRejectModalOrder(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              maxWidth: 450,
              width: '100%',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-xl)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--gray-900)' }}>
              Reject Cancellation #{rejectModalOrder._id.slice(-8)}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '1rem' }}>
              The order will remain active. You can enter an optional reason or explanation for the customer:
            </p>

            <form onSubmit={handleRejectSubmit}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Order has already been dispatched with courier."
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setRejectModalOrder(null)}
                  disabled={processingId === rejectModalOrder._id}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={processingId === rejectModalOrder._id}
                >
                  {processingId === rejectModalOrder._id ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
