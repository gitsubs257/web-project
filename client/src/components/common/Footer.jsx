import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer" style={{ background: '#1c1917', color: '#e7e5e4', paddingTop: '3rem', paddingBottom: '2rem', marginTop: 'auto', borderTop: '1px solid #292524' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#fef08a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src="/logo.png"
                alt="NTC Logo"
                style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--gold)', background: 'white' }}
              />
              Nethaji Tea Company
            </div>
            <p style={{ color: '#a8a29e', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Crafting premium authentic CTC, Rose, Masala, and Green teas with rich flavor and aroma since 1985. Experience traditional purity in every sip.
            </p>
            <div style={{ fontSize: '0.8125rem', color: '#78716c' }}>
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

        <div style={{ borderTop: '1px solid #292524', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', color: '#78716c' }}>
          Nethaji Tea Company · Dedicated to quality, taste, and tradition.
        </div>
      </div>
    </footer>
  )
}
