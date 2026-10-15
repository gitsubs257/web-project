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
      <main className="page-wrapper" style={{ paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '2.5rem' }}>
          <h1 className="section-title" style={{ marginBottom: '0.25rem' }}>Shopping Cart</h1>
          <p className="section-subtitle">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>

          {items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Browse our tea collection and add items to your cart.</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
                Shop Now
              </button>
            </div>
          ) : (
            <div className="cart-page-layout">
              {/* Cart items */}
              <div className="card">
                {/* Select all row */}
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--gray-100)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="select-all-items"
                    className="checkbox-custom"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    aria-label="Select all items"
                  />
                  <label htmlFor="select-all-items" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', color: 'var(--gray-600)' }}>
                    Select All ({items.length})
                  </label>
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

              {/* Summary */}
              <div className="cart-summary">
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
                  {selectedIds.length} of {items.length} items selected
                </div>

                <div className="price-row">
                  <span>Subtotal</span>
                  <span className="font-600">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="price-row">
                  <span>Delivery</span>
                  <span style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <div className="price-row total">
                  <span>Total</span>
                  <span>₹{subtotal.toFixed(0)}</span>
                </div>

                <button
                  id="buy-now-btn"
                  className="btn btn-primary w-full mt-4"
                  style={{ justifyContent: 'center' }}
                  disabled={selectedIds.length === 0}
                  onClick={handleBuyNow}
                >
                  Buy Now ({selectedIds.length})
                </button>
                {selectedIds.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', textAlign: 'center', marginTop: '0.5rem' }}>
                    Select at least one item to proceed
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </>
  )
}
