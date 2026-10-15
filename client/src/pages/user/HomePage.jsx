import { useState, useEffect } from 'react'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import ProductCard from '../../components/user/ProductCard.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { getProducts } from '../../services/api.js'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProducts()
        setProducts(res.data)
      } catch {
        setError('Failed to load products. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Derive categories from products
  const categories = ['All', ...new Set(products.map((p) => p.category))]

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || p.category === category
    return matchSearch && matchCat
  })

  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        {/* Hero */}
        <section className="hero-section" aria-label="Hero banner">
          <div className="hero-content">
            <span className="hero-eyebrow">Est. Since 1985</span>
            <h1 className="hero-title">
              Nethaji Tea Company
            </h1>
            <p className="hero-subtitle">
              Premium handpicked teas from the finest estates of India.
              Experience the authentic taste of tradition in every cup.
            </p>
            <a href="#products" className="btn btn-primary btn-lg" id="hero-shop-now">
              🍃 Shop Now
            </a>
          </div>
        </section>

        {/* Products section */}
        <section id="products" style={{ padding: '3rem 0' }}>
          <div className="container">
            <h2 className="section-title">Our Tea Collection</h2>
            <p className="section-subtitle">Choose from our handcrafted range of premium teas</p>

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                className="form-input"
                placeholder="Search teas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: 280 }}
                id="product-search"
                aria-label="Search products"
              />
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <LoadingSpinner message="Loading products..." />
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍃</div>
                <h3>No products found</h3>
                <p>Try adjusting your search or filter.</p>
              </div>
            ) : (
              <div className="products-grid" aria-label="Product grid">
                {filtered.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
