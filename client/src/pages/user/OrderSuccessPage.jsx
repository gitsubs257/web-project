import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'

export default function OrderSuccessPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        <div
          className="container"
          style={{
            paddingTop: '5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Success animation */}
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--tea-green), var(--tea-green-light))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              marginBottom: '1.5rem',
              boxShadow: '0 8px 30px rgba(58,107,74,0.35)',
              animation: 'popIn 0.5s ease',
            }}
          >
            ✓
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              color: 'var(--tea-green-dark)',
              marginBottom: '0.75rem',
            }}
          >
            Order Placed Successfully!
          </h1>
          <p style={{ color: 'var(--gray-600)', marginBottom: '0.5rem', fontSize: '1rem' }}>
            Thank you for shopping with Nethaji Tea Company.
          </p>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Your order ID:{' '}
            <span
              style={{
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'var(--gray-800)',
                background: 'var(--gray-100)',
                padding: '0.125rem 0.5rem',
                borderRadius: 4,
              }}
            >
              {orderId}
            </span>
          </p>

          <div
            style={{
              background: 'var(--tea-green-pale)',
              border: '1px solid rgba(58,107,74,0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem 2rem',
              marginBottom: '2.5rem',
              maxWidth: 400,
            }}
          >
            <p style={{ color: 'var(--tea-green-dark)', fontWeight: 600, marginBottom: 4 }}>
              🚚 Cash on Delivery
            </p>
            <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
              Your order is being processed. You can track its status in the Orders section.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              id="view-orders-btn"
              className="btn btn-primary"
              onClick={() => navigate('/orders')}
            >
              📦 Track Order
            </button>
            <button
              id="continue-shopping-btn"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>

          <p style={{ marginTop: '2.5rem', marginBottom: '3rem', fontSize: '0.875rem', color: 'var(--gray-500)' }}>
            Have questions about your order? Call us at <a href="tel:9443321952" style={{ color: 'var(--tea-green-dark)', fontWeight: 600 }}>+91 9443321952</a> or email <a href="mailto:sknethajigroups@gmail.com" style={{ color: 'var(--tea-green-dark)', fontWeight: 600 }}>sknethajigroups@gmail.com</a>.
          </p>
        </div>
        <Footer />
      </main>
    </>
  )
}
