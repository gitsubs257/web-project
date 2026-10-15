export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-overlay" role="status">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--gray-500)', fontSize: '0.875rem' }}>
          {message}
        </p>
      </div>
    </div>
  )
}
