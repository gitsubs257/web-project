import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getProductById, getProductReviews, getReviewEligibility, deleteProductReview } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getImageUrl } from '../../utils/imageUrl.js'
import ReviewModal from '../../components/user/ReviewModal.jsx'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [adding, setAdding] = useState(false)

  // Review states
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasDeliveredOrder: false,
    deliveredOrderId: null,
    existingReview: null,
  })
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [deletingReviewId, setDeletingReviewId] = useState(null)

  const fetchReviews = async () => {
    try {
      const res = await getProductReviews(id)
      setReviewsData(res.data)
    } catch {
      // ignore
    }
  }

  const fetchEligibility = async () => {
    if (!isAuthenticated) {
      setEligibility({ canReview: false, hasDeliveredOrder: false, deliveredOrderId: null, existingReview: null })
      return
    }
    try {
      const res = await getReviewEligibility(id)
      setEligibility(res.data)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchEligibility()
  }, [id, isAuthenticated])

  const handleReviewSuccess = () => {
    fetchReviews()
    fetchEligibility()
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to remove your review?')) return
    setDeletingReviewId(reviewId)
    try {
      await deleteProductReview(id, reviewId)
      showToast('Review removed successfully', 'success')
      fetchReviews()
      fetchEligibility()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove review', 'error')
    } finally {
      setDeletingReviewId(null)
    }
  }

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getProductById(id)
        setProduct(res.data)
        setSelectedVariant(res.data.variants?.[0] || null)
      } catch {
        showToast('Product not found', 'error')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast('Please login to add items to your cart', 'warning')
      navigate('/login')
      return
    }
    if (!selectedVariant || selectedVariant.stock < 1) return
    try {
      setAdding(true)
      await addItem(product._id, selectedVariant.weight)
      showToast(`${product.name} added to cart!`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <><Navbar /><div className="page-wrapper"><LoadingSpinner /></div></>
  if (!product) return null

  const imageUrl = getImageUrl(product.image)
  const isOutOfStock = !selectedVariant || selectedVariant.stock < 1

  return (
    <>
      <Navbar />
      <main className="page-wrapper" style={{ paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '2.5rem' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')} style={{ color: 'var(--tea-green)', padding: 0 }}>
              ← Back to Products
            </button>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
            {/* Image */}
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: '#ffffff', padding: '1rem' }}>
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'contain' }} />
              ) : (
                <div className="product-image-placeholder" style={{ aspectRatio: '1', borderRadius: 0, fontSize: '1rem' }}>
                  <span style={{ fontSize: '5rem' }}>🍃</span>
                  <span>Product Image</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Upload via Admin Dashboard</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', background: 'var(--gold-pale)', border: '1px solid var(--gold-border)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                  {product.category}
                </span>
                {reviewsData.totalReviews > 0 ? (
                  <a
                    href="#customer-reviews"
                    style={{ fontSize: '0.85rem', color: '#eab308', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                  >
                    <span>{'★'.repeat(Math.round(reviewsData.averageRating))}</span>
                    <strong style={{ color: 'var(--gray-800)' }}>{reviewsData.averageRating.toFixed(1)}</strong>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.78125rem' }}>
                      ({reviewsData.totalReviews} Verified Review{reviewsData.totalReviews !== 1 ? 's' : ''})
                    </span>
                  </a>
                ) : (
                  <span style={{ fontSize: '0.78125rem', color: 'var(--gray-500)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ color: '#eab308' }}>★</span>
                    <span>No reviews yet · Verified buyers review post-delivery</span>
                  </span>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--tea-green-dark)', letterSpacing: '0.02em', marginBottom: '1rem', lineHeight: 1.15 }}>
                {product.name}
              </h1>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontStyle: 'italic', color: 'var(--gray-700)', lineHeight: 1.7, marginBottom: '2rem' }}>
                {product.description}
              </p>

              {/* Variant selector */}
              <div style={{ marginBottom: '1.75rem' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--gray-800)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Select Package Weight:
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.weight}
                      id={`variant-btn-${v.weight}`}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock < 1}
                      style={{
                        padding: '0.65rem 1.4rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedVariant?.weight === v.weight ? 'var(--gold)' : 'var(--gray-200)'}`,
                        background: selectedVariant?.weight === v.weight ? 'var(--gold-pale)' : 'var(--white)',
                        color: v.stock < 1 ? 'var(--gray-300)' : selectedVariant?.weight === v.weight ? 'var(--tea-green-dark)' : 'var(--gray-800)',
                        fontWeight: 700,
                        cursor: v.stock < 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.9375rem',
                        boxShadow: selectedVariant?.weight === v.weight ? '0 4px 12px rgba(197, 155, 39, 0.25)' : 'none',
                      }}
                    >
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', background: 'var(--cream)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(197, 155, 39, 0.2)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block' }}>Estate Price</span>
                  <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--tea-green-dark)', lineHeight: 1 }}>
                    ₹{selectedVariant?.price ?? '—'}
                  </span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                    {isOutOfStock ? 'Out of Stock' : `✓ Fresh Batch In Stock (${selectedVariant?.stock})`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem' }}>
                <button
                  id="product-add-to-cart"
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, var(--tea-green), var(--tea-deep))',
                    border: '1.5px solid var(--gold-border)',
                    boxShadow: '0 6px 20px rgba(18, 40, 26, 0.25)',
                    fontSize: '1.05rem',
                    padding: '1rem',
                  }}
                >
                  {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : '🛒 Add to Tea Bag'}
                </button>
              </div>

              {/* Estate Highlights Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🏔️</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tea-green-dark)' }}>Estate Origin</strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--gray-600)' }}>100% Upper Assam River Valley Gardens</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🔒</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tea-green-dark)' }}>Aroma Protection</strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--gray-600)' }}>Nitrogen Flushed Multi-Layer Pouch</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🚚</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tea-green-dark)' }}>Free Express Delivery</strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--gray-600)' }}>Dispatched directly from packaging unit</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🏆</span>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tea-green-dark)' }}>100% Authentic</strong>
                    <span style={{ fontSize: '0.78125rem', color: 'var(--gray-600)' }}>Crafted by Nethaji Tea Co. Since 1985</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Customer Reviews & Ratings Section ── */}
          <section id="customer-reviews" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold-dark)', background: 'var(--gold-pale)', border: '1px solid var(--gold-border)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                🍃 Customer Impressions
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--tea-deep)', margin: 0 }}>
                Verified Customer Reviews
              </h2>
              <p style={{ color: 'var(--gray-600)', fontSize: '0.9375rem', marginTop: '0.35rem' }}>
                Authentic ratings submitted exclusively by tea lovers after their order has been delivered.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
              {/* Summary & Rating Breakdown */}
              <div style={{ background: '#ffffff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ textAlign: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--tea-deep)', lineHeight: 1, fontFamily: 'var(--font-display)' }}>
                    {reviewsData.totalReviews > 0 ? reviewsData.averageRating.toFixed(1) : '0.0'}
                  </div>
                  <div style={{ fontSize: '1.5rem', color: '#eab308', margin: '0.5rem 0' }}>
                    {'★'.repeat(Math.round(reviewsData.averageRating || 0)) + '☆'.repeat(5 - Math.round(reviewsData.averageRating || 0))}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', fontWeight: 500 }}>
                    Based on {reviewsData.totalReviews} verified {reviewsData.totalReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </div>

                {/* Rating Distribution Bars */}
                <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewsData.ratingCounts?.[star] || 0
                    const pct = reviewsData.totalReviews > 0 ? (count / reviewsData.totalReviews) * 100 : 0
                    return (
                      <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem' }}>
                        <span style={{ width: 45, fontWeight: 600, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {star} <span style={{ color: '#eab308' }}>★</span>
                        </span>
                        <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: '#eab308',
                              borderRadius: 'var(--radius-full)',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ width: 30, textAlign: 'right', color: 'var(--gray-500)', fontWeight: 500 }}>
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Write Review Prompt Card */}
                <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--gray-100)' }}>
                  {!isAuthenticated ? (
                    <div style={{ textAlign: 'center', background: 'var(--cream)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(197, 155, 39, 0.2)' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--tea-deep)', fontWeight: 600, margin: '0 0 0.75rem 0' }}>
                        Have you received this tea in a delivered order?
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate('/login')}
                        style={{ width: '100%', background: 'var(--tea-green)' }}
                      >
                        Sign in to leave a review
                      </button>
                    </div>
                  ) : eligibility.canReview ? (
                    <div style={{ textAlign: 'center', background: '#f0fdf4', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
                      <p style={{ fontSize: '0.85rem', color: '#166534', fontWeight: 600, margin: '0 0 0.75rem 0' }}>
                        ✓ Order Delivered! You are eligible to review this tea.
                      </p>
                      <button
                        id="open-review-modal-btn"
                        className="btn btn-primary"
                        onClick={() => setIsReviewModalOpen(true)}
                        style={{ width: '100%', background: 'linear-gradient(135deg, var(--tea-green), var(--tea-deep))', border: '1.5px solid var(--gold-border)' }}
                      >
                        {eligibility.existingReview ? '✏️ Edit Your Review' : '⭐ Write a Product Review'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ background: '#fafaf9', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>🛡️</span>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--gray-800)', display: 'block' }}>
                            Verified Buyers Only
                          </strong>
                          <p style={{ fontSize: '0.78125rem', color: 'var(--gray-600)', margin: '0.25rem 0 0.75rem 0', lineHeight: 1.5 }}>
                            To guarantee genuine feedback, product reviews can only be submitted after your order containing this tea has been marked as <strong>Delivered</strong>.
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => navigate('/orders')}
                        style={{ width: '100%', color: 'var(--tea-green)', fontWeight: 600, border: '1px solid var(--gray-300)' }}
                      >
                        Track My Orders →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', margin: 0 }}>
                    Customer Feedback ({reviewsData.totalReviews})
                  </h3>
                  {eligibility.canReview && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsReviewModalOpen(true)}
                      style={{ fontSize: '0.8125rem' }}
                    >
                      {eligibility.existingReview ? 'Edit My Review' : 'Write Review'}
                    </button>
                  )}
                </div>

                {reviewsData.reviews.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', textAlign: 'center', border: '1px solid var(--gray-200)' }}>
                    <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.75rem' }}>🍃</span>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--tea-deep)', marginBottom: '0.5rem' }}>
                      No reviews yet
                    </h4>
                    <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', maxWidth: 400, margin: '0 auto 1.25rem auto', lineHeight: 1.6 }}>
                      Be the first to share your tasting notes! Verified customers can review this blend as soon as their package is delivered.
                    </p>
                    {eligibility.canReview && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setIsReviewModalOpen(true)}
                      >
                        Leave First Review
                      </button>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {reviewsData.reviews.map((rev) => {
                      const reviewerName = rev.user
                        ? `${rev.user.firstName || ''} ${rev.user.lastName ? rev.user.lastName.charAt(0) + '.' : ''}`.trim() || 'Tea Lover'
                        : 'Verified Customer'
                      const isOwnReview = user && rev.user && (user._id === rev.user._id || user._id === rev.user)
                      const canDelete = isOwnReview || (user && user.role === 'admin')
                      const reviewDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })

                      return (
                        <div
                          key={rev._id}
                          style={{
                            background: '#ffffff',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.5rem',
                            border: '1px solid var(--gray-200)',
                            boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 'var(--radius-full)',
                                  background: 'linear-gradient(135deg, var(--tea-green-pale), #bbf7d0)',
                                  color: 'var(--tea-green-dark)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 700,
                                  fontSize: '0.9375rem',
                                }}
                              >
                                {reviewerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.9375rem', color: 'var(--gray-900)' }}>
                                    {reviewerName}
                                  </strong>
                                  {rev.isVerifiedPurchase && (
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                                      ✓ Verified Buyer
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                                  Reviewed on {reviewDate}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ color: '#eab308', fontSize: '1rem', letterSpacing: '0.1em' }}>
                                {'★'.repeat(rev.rating) + '☆'.repeat(5 - rev.rating)}
                              </div>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev._id)}
                                  disabled={deletingReviewId === rev._id}
                                  title="Remove review"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--gray-400)',
                                    cursor: 'pointer',
                                    padding: '0.2rem',
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>

                          {rev.title && (
                            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tea-deep)', margin: '0 0 0.5rem 0' }}>
                              {rev.title}
                            </h4>
                          )}

                          <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                            {rev.comment}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </main>

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          product={product}
          orderId={eligibility.deliveredOrderId}
          existingReview={eligibility.existingReview}
          onClose={() => setIsReviewModalOpen(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  )
}
