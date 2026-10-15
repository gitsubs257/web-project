import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * CartItem — single row in the Cart page.
 * Includes: checkbox (for "Buy Now" selection), image, name, weight, qty controls, price, remove.
 */
export default function CartItem({ item, selected, onToggleSelect }) {
  const { updateItem, removeItem } = useCart()
  const { showToast } = useToast()

  const product = item.product
  const imageUrl = product?.image ? `${BACKEND_URL}/${product.image}` : null
  const variant = product?.variants?.find((v) => v.weight === item.variantWeight)
  const price = variant?.price ?? 0

  const handleQtyChange = async (newQty) => {
    if (newQty < 1) return
    try {
      await updateItem(item._id, newQty)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update quantity', 'error')
    }
  }

  const handleRemove = async () => {
    try {
      await removeItem(item._id)
      showToast('Item removed from cart', 'info')
    } catch {
      showToast('Failed to remove item', 'error')
    }
  }

  return (
    <div className="cart-item">
      {/* Selection checkbox */}
      <input
        type="checkbox"
        className="checkbox-custom"
        id={`select-item-${item._id}`}
        checked={selected}
        onChange={() => onToggleSelect(item._id)}
        aria-label={`Select ${product?.name}`}
      />

      {/* Product image */}
      <div style={{ width: 70, height: 70, flexShrink: 0 }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="product-image-placeholder" style={{ width: 70, height: 70, borderRadius: 8, fontSize: '0.7rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🍃</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-600 truncate" style={{ fontSize: '0.9375rem', marginBottom: 2 }}>
          {product?.name}
        </div>
        <div className="text-gray" style={{ fontSize: '0.8125rem', marginBottom: 6 }}>
          {item.variantWeight}
        </div>
        {/* Qty controls */}
        <div className="qty-controls">
          <button className="qty-btn" onClick={() => handleQtyChange(item.quantity - 1)} aria-label="Decrease quantity">−</button>
          <span className="qty-display">{item.quantity}</span>
          <button className="qty-btn" onClick={() => handleQtyChange(item.quantity + 1)} aria-label="Increase quantity">+</button>
        </div>
      </div>

      {/* Price + Remove */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        <span className="product-price" style={{ fontSize: '1rem' }}>
          ₹{(price * item.quantity).toFixed(0)}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--error)', padding: '0.25rem 0.5rem', fontSize: '0.8125rem' }}
          onClick={handleRemove}
          aria-label={`Remove ${product?.name}`}
        >
          Remove
        </button>
      </div>
    </div>
  )
}
