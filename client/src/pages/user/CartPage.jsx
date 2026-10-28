import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import CartItem from '../../components/user/CartItem.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useCart } from '../../context/CartContext.jsx'

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, cartLoading } = useCart()
  const items = cart?.items || []

  // Track which items are selected for "Buy Now"
  const [selectedIds, setSelectedIds] = useState([])

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((i) => i._id))
    }
  }

  // Compute subtotal of selected items only
  const selectedItems = items.filter((i) => selectedIds.includes(i._id))
  const subtotal = selectedItems.reduce((sum, item) => {
    const variant = item.product?.variants?.find((v) => v.weight === item.variantWeight)
    return sum + (variant?.price || 0) * item.quantity
  }, 0)

  const handleBuyNow = () => {
    if (selectedIds.length === 0) return
    // Pass selected item IDs via location state
    navigate('/checkout', { state: { selectedItemIds: selectedIds } })
  }

  if (cartLoading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper"><LoadingSpinner /></div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="page-wrapper" style={{ paddingBottom: '6rem', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ paddingTop: '2.5rem' }}>
          {/* Luxury Page Header */}
          <div className="luxury-page-header">
            <h1 className="luxury-page-title">Artisan Tea Cart</h1>
            <p className="luxury-page-subtitle">
              Handpicked single-origin Assam leaves • Vacuum packed for peak aromatic richness
            </p>
            <div className="luxury-gold-divider" />
            <div style={{ marginTop: '0.6rem', fontSize: '0.85rem', color: 'var(--gray-500)', fontWeight: 500 }}>
              {items.length} Unique Blend{items.length !== 1 ? 's' : ''} in Your Cart
            </div>
          </div>

          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: '3.5rem 1.5rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid rgba(197, 155, 39, 0.2)' }}>
              <div className="empty-state-icon" style={{ fontSize: '3.5rem' }}>🍃</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--tea-deep)' }}>Your tea cart is currently empty</h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--gray-600)' }}>
                Discover the rich malty flavor of our Upper Assam estate harvest.
              </p>
              <button id="cart-shop-now-btn" className="btn btn-primary mt-4" onClick={() => navigate('/')}>
                Explore Assam Collection →
              </button>
            </div>
          ) : (
            <>
              {/* Trust banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  padding: '0.75rem 1rem',
                  background: 'var(--tea-green-pale)',
                  border: '1px solid rgba(58, 107, 74, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--tea-green-dark)',
                  fontWeight: 600,
                }}
              >
                <span>🌿 100% Pure Assam Tea</span>
                <span>•</span>
                <span>🚚 Free Standard Delivery</span>
                <span>•</span>
                <span>💵 Cash on Delivery Available</span>
              </div>

              <div className="cart-page-layout">
                {/* Cart items */}
                <div className="card" style={{ border: '1.5px solid rgba(197, 155, 39, 0.2)' }}>
                  {/* Select all row */}
                  <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafaf9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        id="select-all-items"
                        className="checkbox-custom"
                        checked={selectedIds.length === items.length && items.length > 0}
                        onChange={toggleSelectAll}
                        aria-label="Select all items"
                      />
                      <label htmlFor="select-all-items" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', color: 'var(--tea-deep)' }}>
                        Select All Blends ({items.length})
                      </label>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>
                      {selectedIds.length} chosen for checkout
                    </span>
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {items.map((item) => (
                      <CartItem
                        key={item._id}
                        item={item}
                        selected={selectedIds.includes(item._id)}
                        onToggleSelect={toggleSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* Summary (Desktop & Tablet) */}
                <div className="cart-summary" style={{ border: '1.5px solid rgba(197, 155, 39, 0.25)', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--tea-deep)' }}>
                    Order Summary
                  </h2>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', marginBottom: '1.25rem' }}>
                    {selectedIds.length} of {items.length} item(s) selected
                  </div>

                  <div className="price-row">
                    <span style={{ color: 'var(--gray-600)' }}>Subtotal</span>
                    <span className="font-600" style={{ fontSize: '1.05rem', color: 'var(--tea-deep)' }}>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="price-row">
                    <span style={{ color: 'var(--gray-600)' }}>Estate Direct Delivery</span>
                    <span style={{ color: 'var(--tea-green)', fontWeight: 700 }}>FREE</span>
                  </div>
                  <div className="divider" style={{ margin: '0.75rem 0' }} />
                  <div className="price-row total">
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Final Amount</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: 'var(--tea-deep)' }}>
                      ₹{subtotal.toFixed(0)}
                    </span>
                  </div>

                  <button
                    id="buy-now-btn"
                    className="btn btn-primary w-full mt-4"
                    style={{ justifyContent: 'center', padding: '0.85rem 1rem', fontSize: '1rem', letterSpacing: '0.02em' }}
                    disabled={selectedIds.length === 0}
                    onClick={handleBuyNow}
                  >
                    Buy Now ({selectedIds.length}) →
                  </button>
                  {selectedIds.length === 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '0.5rem' }}>
                      Select at least one tea blend above to proceed
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Sticky Summary Bar (Competitive Mobile Touch UX) */}
              <div className="cart-mobile-summary-bar">
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                    {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--tea-deep)' }}>
                    ₹{subtotal.toFixed(0)}
                  </div>
                </div>
                <button
                  id="mobile-buy-now-btn"
                  className="btn btn-primary"
                  style={{ padding: '0.625rem 1.25rem', fontSize: '0.95rem' }}
                  disabled={selectedIds.length === 0}
                  onClick={handleBuyNow}
                >
                  Buy Now ({selectedIds.length}) →
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
