import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getMyOrders, getMyReviews, requestCancelOrder } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import ReviewModal from '../../components/user/ReviewModal.jsx'

const STATUS_STEPS = ['Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
const STATUS_ICONS = {
  Processing: '📋',
  Packed: '📦',
  Shipped: '🚛',
  'Out for Delivery': '🛵',
  Delivered: '✅',
  Cancelled: '❌',
  Failed: '⚠️',
}

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Incorrect delivery address or contact number',
  'Changed my mind / want to order a different tea',
  'Found a better deal / price',
  'Expected faster delivery date',
  'Other reason (please specify)',
]

function TrackingTimeline({ status }) {
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="tracking-timeline" role="list" aria-label="Order tracking">
      {STATUS_STEPS.map((step, idx) => {
        const done    = idx < currentIdx
        const current = idx === currentIdx
        return (
          <div
            key={step}
            className={`tracking-step${done ? ' done' : current ? ' current' : ''}`}
            role="listitem"
            aria-current={current ? 'step' : undefined}
          >
            <div className="tracking-dot">
              {done ? '✓' : STATUS_ICONS[step]}
            </div>
            <span className="tracking-label">{step}</span>
          </div>
        )
      })}
    </div>
  )
}

function OrderCard({ order, onCancelClick, onReviewClick, myReviews }) {
  const [expanded, setExpanded] = useState(false)
  const isActive = !['Delivered', 'Cancelled', 'Failed'].includes(order.status)
  const isFailed = ['Cancelled', 'Failed'].includes(order.status)

  // Rules: If order is Out for Delivery, Delivered, Cancelled or Failed -> CANNOT cancel
  const isOutForDelivery = order.status === 'Out for Delivery'
  const isPendingCancel = order.cancellationRequest?.status === 'Pending'
  const isApprovedCancel = order.cancellationRequest?.status === 'Approved'
  const isRejectedCancel = order.cancellationRequest?.status === 'Rejected'

  const canCancel =
    !isOutForDelivery &&
    !['Delivered', 'Cancelled', 'Failed'].includes(order.status) &&
    !isPendingCancel &&
    !isApprovedCancel

  return (
    <div className="order-card-luxury">
      <div
        className="card-header"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', background: '#fafaf9' }}
        onClick={() => setExpanded((p) => !p)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="order-id-chip">
              #{order._id.slice(-8).toUpperCase()}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', fontWeight: 500 }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--tea-deep)', marginTop: 2, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '1.1rem', color: 'var(--tea-deep)', fontFamily: 'var(--font-display)' }}>
              ₹{order.totalAmount.toFixed(0)}
            </strong>
            <span style={{ color: 'var(--gray-400)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{order.paymentMethod}</span>
            <span style={{ color: 'var(--gray-400)' }}>•</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--gray-600)' }}>{order.items?.length || 1} item(s)</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span
            className={`badge ${
              order.status === 'Delivered' ? 'badge-green'
              : isFailed ? 'badge-red'
              : 'badge-yellow'
            }`}
            style={{ fontWeight: 600, padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
          >
            {STATUS_ICONS[order.status]} {order.status}
          </span>
          {isPendingCancel && (
            <span className="badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontWeight: 600 }}>
              ⏳ Cancel Review
            </span>
          )}
          <span style={{ color: 'var(--tea-green)', fontSize: '1.1rem', width: 24, textAlign: 'center', fontWeight: 'bold' }}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {expanded && (
        <div className="card-body" style={{ padding: '1.25rem' }}>
          {/* Tracking timeline (only for active orders) */}
          {!isFailed && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--tea-deep)', fontFamily: 'var(--font-display)' }}>
                  Estate Direct Tracking
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold)', fontWeight: 600 }}>
                  🍃 Upper Assam Dispatch
                </span>
              </div>
              <TrackingTimeline status={order.status} />
              <div className="divider" style={{ margin: '1rem 0' }} />
            </>
          )}

          {/* Cancellation Notices */}
          {isPendingCancel && (
            <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 600, color: '#92400e', fontSize: '0.875rem' }}>
                ⏳ Cancellation Request Under Review
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#b45309', marginTop: 3 }}>
                Reason: <strong>{order.cancellationRequest?.reason}</strong>
                {order.cancellationRequest?.otherReason && ` — "${order.cancellationRequest.otherReason}"`}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78350f', marginTop: 4 }}>
                Our administration team has received your request and will review it shortly.
              </div>
            </div>
          )}

          {isRejectedCancel && !['Delivered', 'Cancelled'].includes(order.status) && (
            <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.875rem' }}>
                ⚠️ Cancellation Request Declined by Admin
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#b91c1c', marginTop: 3 }}>
                {order.cancellationRequest?.adminComment || 'Order is already in fulfillment and being prepared for delivery.'}
              </div>
            </div>
          )}

          {/* Items */}
          <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
            Items Ordered
          </h4>
          {order.items.map((item, idx) => {
            const itemProductId = item.product?._id || item.product
            const existingReview = myReviews?.[itemProductId]
            return (
              <div
                key={idx}
                style={{
                  padding: '0.65rem 0',
                  borderBottom: idx < order.items.length - 1 ? '1px solid var(--gray-100)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--gray-800)', fontWeight: 600 }}>
                    {item.name} <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>({item.variantWeight})</span> × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 700, color: 'var(--tea-deep)' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>

                {order.status === 'Delivered' && (
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.45rem 0.75rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78125rem' }}>
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Delivered</span>
                      {existingReview ? (
                        <span style={{ color: '#ca8a04', fontWeight: 600 }}>
                          · You rated: {'★'.repeat(existingReview.rating)} ({existingReview.rating}/5)
                        </span>
                      ) : (
                        <span style={{ color: 'var(--gray-500)' }}>
                          · How was your tea? Share your feedback
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      id={`review-btn-${order._id}-${itemProductId}`}
                      className="btn btn-sm"
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.3rem 0.75rem',
                        height: 'auto',
                        borderRadius: 'var(--radius-full)',
                        background: existingReview ? '#ffffff' : 'linear-gradient(135deg, var(--tea-green), var(--tea-deep))',
                        color: existingReview ? 'var(--tea-deep)' : '#ffffff',
                        border: existingReview ? '1.5px solid var(--gold-border)' : 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: existingReview ? 'none' : '0 2px 6px rgba(18, 40, 26, 0.2)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onReviewClick(item, order._id, existingReview)
                      }}
                    >
                      {existingReview ? '✏️ Edit Review' : '⭐ Write Review'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Address */}
          {order.shippingAddress && (
            <>
              <div className="divider" />
              <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                Delivery Address
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--gray-600)', lineHeight: 1.6 }}>
                {order.shippingAddress.fullName} · {order.shippingAddress.phone}<br />
                {order.shippingAddress.doorNo}, {order.shippingAddress.street},{' '}
                {order.shippingAddress.area && `${order.shippingAddress.area}, `}
                {order.shippingAddress.city} — {order.shippingAddress.pincode},{' '}
                {order.shippingAddress.state}
              </p>
            </>
          )}

          {/* Cancel Order Action */}
          {canCancel && (
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                Want to cancel this order?
              </div>
              <button
                id={`cancel-order-btn-${order._id}`}
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onCancelClick(order)
                }}
              >
                ✕ Cancel Order
              </button>
            </div>
          )}

          {/* Note if Out for Delivery */}
          {isOutForDelivery && (
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)', fontSize: '0.8125rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>
              🛵 Order is out for delivery with our courier and cannot be cancelled online. For urgent questions, call <strong>9443321952</strong> or email <strong>sknethajigroups@gmail.com</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CancelOrderModal({ order, onClose, onSuccess }) {
  const { showToast } = useToast()
  const [selectedReason, setSelectedReason] = useState('')
  const [otherText, setOtherText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReason) {
      showToast('Please choose a reason for cancelling', 'warning')
      return
    }
    if (selectedReason === 'Other reason (please specify)' && !otherText.trim()) {
      showToast('Please provide details for the cancellation reason', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await requestCancelOrder(order._id, {
        reason: selectedReason,
        otherReason: otherText.trim(),
      })
      showToast('Cancellation request submitted to admin for review', 'success')
      onSuccess(res.data.order)
      onClose()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit cancellation request', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 480,
          width: '100%',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            Cancel Order #{order._id.slice(-8)}
          </h3>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: '1.25rem' }}>
          Please select a reason for cancelling this order. Your request will be immediately sent to our admin team.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {CANCELLATION_REASONS.map((r) => (
              <label
                key={r}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: selectedReason === r ? '1.5px solid var(--tea-green)' : '1px solid var(--gray-200)',
                  background: selectedReason === r ? 'var(--tea-green-pale)' : '#fafafa',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="cancellationReason"
                  value={r}
                  checked={selectedReason === r}
                  onChange={(e) => setSelectedReason(e.target.value)}
                />
                <span style={{ fontWeight: selectedReason === r ? 600 : 400 }}>{r}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other reason (please specify)' && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="cancel-other-reason">
                Please specify your reason: *
              </label>
              <textarea
                id="cancel-other-reason"
                className="form-input"
                rows={3}
                placeholder="Tell us what happened..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Keep Order
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [myReviews, setMyReviews] = useState({})
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('current')
  const [selectedCancelOrder, setSelectedCancelOrder] = useState(null)
  const [reviewTarget, setReviewTarget] = useState({
    isOpen: false,
    product: null,
    orderId: null,
    existingReview: null,
  })

  const fetchOrders = async () => {
    try {
      const [ordersRes, reviewsRes] = await Promise.all([
        getMyOrders(),
        getMyReviews().catch(() => ({ data: [] })),
      ])
      setOrders(ordersRes.data || [])
      const rMap = {}
      if (Array.isArray(reviewsRes.data)) {
        reviewsRes.data.forEach((r) => {
          const pid = r.product?._id || r.product
          if (pid) rMap[pid] = r
        })
      }
      setMyReviews(rMap)
    } catch {
      // handle silently
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleOrderUpdate = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
    )
  }

  const handleOpenReview = (item, orderId, existingReview) => {
    setReviewTarget({
      isOpen: true,
      product: {
        _id: item.product?._id || item.product,
        name: item.name,
        image: item.image,
        variantWeight: item.variantWeight,
      },
      orderId,
      existingReview,
    })
  }

  const handleReviewSuccess = (savedReview) => {
    const pid = savedReview.product?._id || savedReview.product
    if (pid) {
      setMyReviews((prev) => ({ ...prev, [pid]: savedReview }))
    }
  }

  const currentOrders   = orders.filter((o) => !['Delivered', 'Cancelled', 'Failed'].includes(o.status))
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered')
  const failedOrders    = orders.filter((o) => ['Cancelled', 'Failed'].includes(o.status))

  const displayOrders =
    tab === 'current'   ? currentOrders
    : tab === 'old'     ? deliveredOrders
    : failedOrders

  return (
    <>
      <Navbar />
      <main className="page-wrapper" style={{ paddingBottom: '5rem', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ paddingTop: '2.5rem', maxWidth: 880 }}>
          {/* Luxury Page Header */}
          <div className="luxury-page-header">
            <h1 className="luxury-page-title">My Orders & Tea Reserves</h1>
            <p className="luxury-page-subtitle">
              Direct shipments handcrafted from the fertile Brahmaputra Valley, Upper Assam
            </p>
            <div className="luxury-gold-divider" />
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
              {orders.length} Total Order{orders.length !== 1 ? 's' : ''} on Record
            </div>
          </div>

          {/* Tabs */}
          <div className="order-tabs" role="tablist">
            <button
              id="tab-current"
              role="tab"
              aria-selected={tab === 'current'}
              className={`order-tab ${tab === 'current' ? 'active' : ''}`}
              onClick={() => setTab('current')}
            >
              Current & Dispatched ({currentOrders.length})
            </button>
            <button
              id="tab-delivered"
              role="tab"
              aria-selected={tab === 'old'}
              className={`order-tab ${tab === 'old' ? 'active' : ''}`}
              onClick={() => setTab('old')}
            >
              Delivered ({deliveredOrders.length})
            </button>
            <button
              id="tab-failed"
              role="tab"
              aria-selected={tab === 'failed'}
              className={`order-tab ${tab === 'failed' ? 'active' : ''}`}
              onClick={() => setTab('failed')}
            >
              Cancelled / Returned ({failedOrders.length})
            </button>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : displayOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No orders here</h3>
              <p>You have no {tab} orders yet.</p>
            </div>
          ) : (
            <div>
              {displayOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onCancelClick={(ord) => setSelectedCancelOrder(ord)}
                  onReviewClick={handleOpenReview}
                  myReviews={myReviews}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Cancel Modal */}
      {selectedCancelOrder && (
        <CancelOrderModal
          order={selectedCancelOrder}
          onClose={() => setSelectedCancelOrder(null)}
          onSuccess={handleOrderUpdate}
        />
      )}

      {/* Product Review Modal (Only for delivered orders) */}
      {reviewTarget.isOpen && (
        <ReviewModal
          isOpen={reviewTarget.isOpen}
          product={reviewTarget.product}
          orderId={reviewTarget.orderId}
          existingReview={reviewTarget.existingReview}
          onClose={() => setReviewTarget((prev) => ({ ...prev, isOpen: false }))}
          onSuccess={handleReviewSuccess}
        />
      )}

      <Footer />
    </>
  )
}
