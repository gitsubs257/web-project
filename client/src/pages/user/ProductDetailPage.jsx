import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getProductById } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [adding, setAdding] = useState(false)

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

  const imageUrl = product.image ? `${BACKEND_URL}/${product.image}` : null
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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--tea-green)', background: 'var(--tea-green-pale)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)' }}>
                {product.category}
              </span>
              <h1 style={{ fontSize: '2.25rem', marginTop: '0.75rem', marginBottom: '1rem' }}>{product.name}</h1>
              <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: '2rem' }}>{product.description}</p>

              {/* Variant selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--gray-700)' }}>Select Weight:</p>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => (
                    <button
                      key={v.weight}
                      id={`variant-btn-${v.weight}`}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock < 1}
                      style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selectedVariant?.weight === v.weight ? 'var(--tea-green)' : 'var(--gray-200)'}`,
                        background: selectedVariant?.weight === v.weight ? 'var(--tea-green-pale)' : 'var(--white)',
                        color: v.stock < 1 ? 'var(--gray-300)' : selectedVariant?.weight === v.weight ? 'var(--tea-green)' : 'var(--gray-700)',
                        fontWeight: 600,
                        cursor: v.stock < 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.9rem',
                      }}
                    >
                      {v.weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Stock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brown)' }}>
                  ₹{selectedVariant?.price ?? '—'}
                </span>
                <span className={`stock-badge ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                  {isOutOfStock ? 'Out of Stock' : `In Stock (${selectedVariant?.stock})`}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  id="product-add-to-cart"
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                  style={{ flex: 1 }}
                >
                  {adding ? 'Adding...' : '🛒 Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}
