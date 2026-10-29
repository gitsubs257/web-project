import { useState, useEffect } from 'react'
import { submitProductReview } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import { getImageUrl } from '../../utils/imageUrl.js'

const RATING_LABELS = {
  1: '1★ Poor — Did not meet expectations',
  2: '2★ Fair — Below average experience',
  3: '3★ Good — Satisfactory aroma & taste',
  4: '4★ Very Good — Thoroughly enjoyed the blend',
  5: '5★ Excellent — Outstanding quality & flavor!',
}

export default function ReviewModal({
  isOpen,
  onClose,
  product,
  orderId,
  existingReview,
  onSuccess,
}) {
  const { showToast } = useToast()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5)
      setTitle(existingReview.title || '')
      setComment(existingReview.comment || '')
    } else {
      setRating(5)
      setTitle('')
      setComment('')
    }
  }, [existingReview, isOpen])

  if (!isOpen || !product) return null

  const productId = product._id || product.product || product.productId
  const productName = product.name || 'Artisanal Tea'
  const productImage = product.image ? getImageUrl(product.image) : null
  const displayRating = hoverRating || rating

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating || rating < 1) {
      showToast('Please select a star rating from 1 to 5', 'warning')
      return
    }
    if (!comment.trim()) {
      showToast('Please enter your review comments', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        orderId,
      }
      const res = await submitProductReview(productId, payload)
      showToast(res.data?.message || 'Review submitted successfully!', 'success')
      if (onSuccess) {
        onSuccess(res.data.review)
      }
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit review'
      showToast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 25, 15, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 520,
          width: '100%',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--gold-border)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-full)', marginBottom: '0.35rem' }}>
              ✓ Verified Delivered Purchase
            </div>
            <h3 id="review-modal-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--tea-deep)', fontFamily: 'var(--font-display)', margin: 0 }}>
              {existingReview ? 'Update Your Review' : 'Rate & Review'}
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close review dialog"
            style={{ fontSize: '1.2rem', padding: '0.2rem 0.5rem', color: 'var(--gray-500)' }}
          >
            ✕
          </button>
        </div>

        {/* Product mini card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            padding: '0.875rem',
            background: 'var(--cream)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(197, 155, 39, 0.25)',
            marginBottom: '1.5rem',
          }}
        >
          {productImage ? (
            <img
              src={productImage}
              alt={productName}
              style={{ width: 56, height: 56, objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-md)', padding: 4, border: '1px solid var(--gray-200)' }}
            />
          ) : (
            <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 'var(--radius-md)', fontSize: '1.75rem', border: '1px solid var(--gray-200)' }}>
              🍃
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--tea-deep)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {productName}
            </div>
            {product.variantWeight && (
              <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', display: 'block' }}>
                Purchased Weight: <strong>{product.variantWeight}</strong>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star Rating Picker */}
          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Your Overall Rating *
            </label>
            <div
              style={{
                display: 'inline-flex',
                gap: '0.35rem',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                background: '#fafaf9',
                border: '1px solid var(--gray-200)',
              }}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  id={`star-btn-${star}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '2rem',
                    lineHeight: 1,
                    color: star <= displayRating ? '#eab308' : '#e2e8f0',
                    transition: 'transform 0.15s ease, color 0.15s ease',
                    transform: star <= displayRating ? 'scale(1.15)' : 'scale(1)',
                    padding: '0 0.15rem',
                  }}
                  title={`${star} Star`}
                  aria-label={`${star} Star`}
                >
                  ★
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ca8a04', marginTop: '0.5rem', minHeight: '1.25rem' }}>
              {RATING_LABELS[displayRating] || ''}
            </div>
          </div>

          {/* Review Title */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)', marginBottom: '0.35rem' }}>
              Review Headline (Optional)
            </label>
            <input
              type="text"
              id="review-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rich, aromatic and authentic taste!"
              maxLength={120}
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Review Comment */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--gray-700)' }}>
                Detailed Feedback *
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                {comment.length}/1000
              </span>
            </div>
            <textarea
              id="review-comment-input"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share how this tea tasted, how you prepared it, freshness upon arrival, packaging quality..."
              maxLength={1000}
              required
              className="input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Delivery Note */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.78125rem',
              color: '#166534',
              marginBottom: '1.5rem',
              lineHeight: 1.5,
            }}
          >
            🛡️ <strong>Certified Buyer Guarantee:</strong> Your review is verified directly from your delivered order and helps fellow tea connoisseurs choose genuine blends.
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-review-btn"
              className="btn btn-primary"
              disabled={submitting || !comment.trim()}
              style={{
                background: 'linear-gradient(135deg, var(--tea-green), var(--tea-deep))',
                border: '1.5px solid var(--gold-border)',
                minWidth: 140,
              }}
            >
              {submitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
