import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" style={{ background: 'linear-gradient(180deg, #0d2115 0%, #06110a 100%)', color: '#e7e5e4', paddingTop: '3.5rem', paddingBottom: '2.5rem', marginTop: 'auto', borderTop: '2px solid rgba(197, 155, 39, 0.3)' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', fontWeight: 800, color: '#fef08a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="logo-img-frame" style={{ width: 36, height: 36 }}>
                <img
                  src="/logo.png"
                  alt="NTC Logo"
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              </div>
              Nethaji Tea Company
            </div>
            <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.4rem', color: 'var(--gold-light)', marginBottom: '0.75rem' }}>
              Crafted with passion since 1985
            </div>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Crafting premium authentic CTC, Rose, Masala, and Green teas with rich flavor and aroma. Experience traditional purity in every sip.
            </p>
            <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
              © {new Date().getFullYear()} Nethaji Tea Company. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ color: '#d6d3d1', textDecoration: 'none', transition: 'color 0.2s' }}>
                  🍵 Our Tea Collection
                </Link>
              </li>
              <li>
                <Link to="/orders" style={{ color: '#d6d3d1', textDecoration: 'none', transition: 'color 0.2s' }}>
                  📦 Track Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" style={{ color: '#d6d3d1', textDecoration: 'none', transition: 'color 0.2s' }}>
                  🛒 My Cart
                </Link>
              </li>
              <li>
                <Link to="/account" style={{ color: '#d6d3d1', textDecoration: 'none', transition: 'color 0.2s' }}>
                  👤 Account & Addresses
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>📞</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e', textTransform: 'uppercase' }}>Phone / WhatsApp</div>
                  <a
                    href="tel:9443321952"
                    style={{ color: '#86efac', fontWeight: 600, textDecoration: 'none' }}
                  >
                    +91 9443321952
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>✉️</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e', textTransform: 'uppercase' }}>Email Support</div>
                  <a
                    href="mailto:sknethajigroups@gmail.com"
                    style={{ color: '#86efac', fontWeight: 600, textDecoration: 'none', wordBreak: 'break-all' }}
                  >
                    sknethajigroups@gmail.com
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⏰</span>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#a8a29e', textTransform: 'uppercase' }}>Working Hours</div>
                  <span style={{ color: '#d6d3d1' }}>Mon – Sat: 9:00 AM – 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
          <div>
            Nethaji Tea Company · Dedicated to quality, taste, and tradition since 1985.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--gold-light)' }}>
            <span>💵 Cash on Delivery Available</span>
            <span>🌿 100% Unadulterated</span>
            <span>🔒 Direct Estate Sealed</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
