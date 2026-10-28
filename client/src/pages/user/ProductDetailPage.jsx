import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getProductById } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getImageUrl } from '../../utils/imageUrl.js'

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold-dark)', background: 'var(--gold-pale)', border: '1px solid var(--gold-border)', padding: '0.3rem 0.85rem', borderRadius: 'var(--radius-full)' }}>
                  {product.category}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#eab308' }}>
                  ★★★★★ <strong style={{ color: 'var(--gray-700)' }}>4.9</strong> (120+ Verified Reviews)
                </span>
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
        </div>
        <Footer />
      </main>
    </>
  )
}
