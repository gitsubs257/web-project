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
        {/* ── Luxury Hero Section ── */}
        <section className="hero-section" aria-label="Hero banner">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>★</span> EST. 1985 • ARTISANAL ESTATE HARVEST <span>★</span>
            </div>
            <h1 className="hero-title">
              The Royal Essence of <span className="title-gold">Indian Tea</span>
            </h1>
            <p className="hero-subtitle">
              Handpicked whole leaves from the world-renowned, sun-drenched estates of Upper Assam.
              Roasted and granulated to perfection for an unforgettable, malty golden brew.
            </p>
            
            <div className="hero-actions">
              <a href="#products" className="btn-hero-primary" id="hero-shop-now">
                <span>🍃</span> Explore Collection
              </a>
              <a href="#brewing" className="btn-hero-secondary">
                <span>🍵</span> The Brewing Ritual
              </a>
            </div>

            {/* Hero Trust / Stats Ribbon */}
            <div className="hero-stats-strip">
              <div className="hero-stat-item">
                <div className="hero-stat-icon">🍃</div>
                <div className="hero-stat-text">
                  <strong>100% Pure Assam</strong>
                  <span>Zero artificial flavor</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon">🏆</div>
                <div className="hero-stat-text">
                  <strong>38+ Years Heritage</strong>
                  <span>Master blender craft</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon">🚚</div>
                <div className="hero-stat-text">
                  <strong>Fresh Dispatch</strong>
                  <span>Direct garden to cup</span>
                </div>
              </div>
              <div className="hero-stat-item">
                <div className="hero-stat-icon">⭐</div>
                <div className="hero-stat-text">
                  <strong>4.9 / 5 Rating</strong>
                  <span>50,000+ happy drinkers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4 Pillars of Excellence ── */}
        <section className="pillars-section" aria-label="Why choose Nethaji Tea">
          <div className="container">
            <div className="section-eyebrow">Purity & Tradition</div>
            <h2 className="section-title">The Pillars of Nethaji Tea</h2>
            <p className="section-subtitle">
              How our Upper Assam estate heritage guarantees supreme aroma, color, and taste in every single harvest
            </p>

            <div className="pillars-grid">
              <div className="pillar-card">
                <div className="pillar-icon-box">🌿</div>
                <h3 className="pillar-title">Upper Assam Estates</h3>
                <p className="pillar-desc">
                  Sourced from pristine tea gardens along the fertile Brahmaputra River valley in Assam, giving our tea its deep briskness and rich malty liquor.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box">🌿</div>
                <h3 className="pillar-title">Handpicked Tender Shoots</h3>
                <p className="pillar-desc">
                  Selective early morning harvesting of two leaves and a bud, rich in healthy natural polyphenols and golden tips.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box">🔒</div>
                <h3 className="pillar-title">Aroma-Lock Foil</h3>
                <p className="pillar-desc">
                  Multi-layered nitrogen barrier pouches preserve volatile essential oils so you experience peak garden freshness.
                </p>
              </div>

              <div className="pillar-card">
                <div className="pillar-icon-box">☕</div>
                <h3 className="pillar-title">Signature Blends</h3>
                <p className="pillar-desc">
                  Time-honored recipes created with cardamom, ginger spices, and real dried rose petals for memorable teatime rituals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Products Collection Section ── */}
        <section id="products" className="collection-section">
          <div className="container">
            <div className="section-eyebrow">Finest Harvests</div>
            <h2 className="section-title">Our Signature Collection</h2>
            <p className="section-subtitle">Choose from our handcrafted range of CTC, Rose, Masala, and Green Teas</p>

            {/* Filters & Search */}
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2.5rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--cream)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(197, 155, 39, 0.2)'
              }}
            >
              <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>🔍</span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search signature teas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                  id="product-search"
                  aria-label="Search products"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setCategory(cat)}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      letterSpacing: '0.02em'
                    }}
                  >
                    {cat === 'All' ? '🍵 All Blends' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <LoadingSpinner message="Curating our tea collection..." />
            ) : error ? (
              <div className="alert alert-error">{error}</div>
            ) : filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🍃</div>
                <h3>No teas found</h3>
                <p>Try adjusting your search query or category filter.</p>
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

        {/* ── Heritage & Storytelling Section ── */}
        <section id="heritage" className="heritage-section">
          <div className="heritage-container">
            {/* Left box: Editorial Seal */}
            <div className="heritage-box">
              <span className="heritage-badge-seal">ESTATE SEAL 1985</span>
              <div style={{ fontFamily: 'var(--font-script)', fontSize: '2rem', color: 'var(--gold-dark)' }}>
                Master Blender's Word
              </div>
              <p className="heritage-quote">
                "Tea is never just a morning beverage; it is a sacred ritual of reflection, warmth, and shared joy that bridges generations."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gray-900)' }}>
                    Nethaji Tea Company
                  </div>
                  <div style={{ fontSize: '0.78125rem', color: 'var(--gray-500)' }}>
                    Three Decades of Pure Excellence
                  </div>
                </div>
                <div className="heritage-signature">Nethaji Tea</div>
              </div>
            </div>

            {/* Right text: Craft Story */}
            <div>
              <div className="section-eyebrow" style={{ textAlign: 'left' }}>The Legacy</div>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                From Upper Assam Gardens To Your Morning Cup
              </h2>
              <p style={{ color: 'var(--gray-700)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                For over 38 years, Nethaji Tea Company has partnered exclusively with heritage tea gardens nestled in the rich, fertile river valleys of Upper Assam. Each tea batch is carefully slow-withered, finely granulated, and naturally cured to unleash a bold malty liquor and intoxicating aroma.
              </p>

              <div className="heritage-points">
                <div className="heritage-point-item">
                  <div className="point-bullet">✓</div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--tea-green-dark)', fontSize: '0.9375rem' }}>
                      Traditional CTC & Orthodox Processing
                    </strong>
                    <span style={{ fontSize: '0.84375rem', color: 'var(--gray-600)' }}>
                      Locks in maximum color, briskness, and strength so your daily cup is rich and revitalizing.
                    </span>
                  </div>
                </div>

                <div className="heritage-point-item">
                  <div className="point-bullet">✓</div>
                  <div>
                    <strong style={{ display: 'block', color: 'var(--tea-green-dark)', fontSize: '0.9375rem' }}>
                      Zero Adulteration & 100% Purity
                    </strong>
                    <span style={{ fontSize: '0.84375rem', color: 'var(--gray-600)' }}>
                      No artificial coloring, fillers, or chemical aromas. Only pristine, unadulterated estate leaves.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Interactive Brewing Ritual Guide ── */}
        <section id="brewing" className="brewing-section">
          <div className="container">
            <div className="section-eyebrow">The Connoisseur's Guide</div>
            <h2 className="section-title">The Art of the Royal Brew</h2>
            <p className="section-subtitle">
              Follow these simple master steps to unlock the full malty flavor and brisk liquor of Nethaji Tea
            </p>

            <div className="brewing-grid">
              <div className="brew-card">
                <span className="brew-step-number">STEP 01</span>
                <div className="brew-icon">💧</div>
                <h3 className="brew-title">Fresh Mountain Water</h3>
                <p className="brew-text">
                  Bring freshly drawn spring or filtered water to a vigorous rolling boil (95°C – 100°C).
                </p>
              </div>

              <div className="brew-card">
                <span className="brew-step-number">STEP 02</span>
                <div className="brew-icon">🥄</div>
                <h3 className="brew-title">The Golden Measure</h3>
                <p className="brew-text">
                  Add 1 generous teaspoon (approx. 2.5g) of Nethaji Tea per cup into your heated brewing pot.
                </p>
              </div>

              <div className="brew-card">
                <span className="brew-step-number">STEP 03</span>
                <div className="brew-icon">⏳</div>
                <h3 className="brew-title">Infuse & Steep</h3>
                <p className="brew-text">
                  Allow the leaves to steep gently for 3 to 4 minutes to release rich amber liquor and volatile aromatics.
                </p>
              </div>

              <div className="brew-card">
                <span className="brew-step-number">STEP 04</span>
                <div className="brew-icon">🥛</div>
                <h3 className="brew-title">Savour Your Cup</h3>
                <p className="brew-text">
                  Strain into a fine cup. Enjoy as a pure black infusion or with warm milk and a pinch of cardamom.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Connoisseur Reviews / Testimonials ── */}
        <section className="testimonials-section">
          <div className="container">
            <div className="section-eyebrow" style={{ color: '#fef08a' }}>Real Impressions</div>
            <h2 className="section-title" style={{ color: '#ffffff' }}>What Tea Lovers Say</h2>
            <p className="section-subtitle" style={{ color: '#d1d5db' }}>
              Thousands of households across India begin their dawn with Nethaji Tea Company
            </p>

            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "Varam Tea has become a morning staple in our home. The malty depth and golden color remind me of traditional estate chai. Outstanding quality!"
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">RK</div>
                  <div>
                    <div className="author-name">Ravi Kumar</div>
                    <div className="author-location">Chennai, Tamil Nadu</div>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "The Top Rose Tea is sheer poetry in a cup. Real delicate rose notes without any artificial perfume taste. Our guests never stop praising it."
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">PS</div>
                  <div>
                    <div className="author-name">Priya Sundaram</div>
                    <div className="author-location">Coimbatore, Tamil Nadu</div>
                  </div>
                </div>
              </div>

              <div className="testimonial-card">
                <div>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">
                    "Ordering online was effortless and delivery was prompt. The vacuum aroma seal keeps the Masala tea as fresh as if it was packed yesterday."
                  </p>
                </div>
                <div className="testimonial-author">
                  <div className="author-avatar">AN</div>
                  <div>
                    <div className="author-name">Anand Narayanan</div>
                    <div className="author-location">Bangalore, Karnataka</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── VIP Connoisseurs Club ── */}
        <section className="vip-club-section">
          <div className="container">
            <div className="vip-club-card">
              <div className="section-eyebrow" style={{ fontSize: '1.75rem' }}>Special Welcome Offer</div>
              <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
                Join The Nethaji Tea Circle
              </h2>
              <p style={{ color: 'var(--gray-600)', maxWidth: 540, margin: '0 auto', fontSize: '0.95rem' }}>
                Experience the finest estate-fresh teas delivered to your door. Apply our welcome coupon at checkout for instant savings.
              </p>
              <div>
                <span className="vip-coupon-pill">
                  <span>🏷️</span> 1st Purchase Code: <strong>FIRST15</strong> (15% OFF on ₹150+)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
}
