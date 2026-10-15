import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * ProductCard — shown on the home page grid.
 * Includes: image, category, name, variant dropdown, price, stock badge, Add to Cart.
 */
export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()

  // Default to first variant
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [adding, setAdding] = useState(false)

  const imageUrl = product.image
    ? `${BACKEND_URL}/${product.image}`
    : null

  const handleVariantChange = (e) => {
    const variant = product.variants.find((v) => v.weight === e.target.value)
    setSelectedVariant(variant)
  }

  const handleAddToCart = async (e) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      showToast('Please login to add items to your cart', 'warning')
      navigate('/login')
      return
    }
    if (!selectedVariant || selectedVariant.stock < 1) return
    try {
      setAdding(true)
      await addItem(product._id, selectedVariant.weight)
      showToast(`${product.name} (${selectedVariant.weight}) added to cart!`, 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add to cart', 'error')
    } finally {
      setAdding(false)
    }
  }

  const isOutOfStock = !selectedVariant || selectedVariant.stock < 1

  return (
    <article className="product-card">
      {/* Image */}
      <div
        className="product-card-image-wrap"
        onClick={() => navigate(`/products/${product._id}`)}
        aria-label={`View ${product.name} details`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div
          className="product-image-placeholder"
          style={{ display: imageUrl ? 'none' : 'flex' }}
        >
          <span className="placeholder-icon">🍃</span>
          <span>Product Image</span>
        </div>
      </div>

      {/* Body */}
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3
          className="product-card-name"
          onClick={() => navigate(`/products/${product._id}`)}
        >
          {product.name}
        </h3>

        {/* Variant selector + price */}
        <div className="variant-select-row">
          <select
            id={`variant-${product._id}`}
            className="variant-select"
            value={selectedVariant?.weight || ''}
            onChange={handleVariantChange}
            aria-label="Select weight"
          >
            {product.variants.map((v) => (
              <option key={v.weight} value={v.weight} disabled={v.stock < 1}>
                {v.weight}{v.stock < 1 ? ' (Out of stock)' : ''}
              </option>
            ))}
          </select>
          <span className="product-price">
            ₹{selectedVariant?.price ?? '—'}
          </span>
        </div>

        {/* Stock badge */}
        <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
          {isOutOfStock ? 'Out of Stock' : `In Stock (${selectedVariant.stock})`}
        </span>

        {/* Add to Cart */}
        <button
          id={`add-to-cart-${product._id}`}
          className="add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={isOutOfStock || adding}
        >
          {adding ? 'Adding...' : isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
        </button>
      </div>
    </article>
  )
}
