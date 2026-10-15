import { useState, useEffect } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, toggleCoupon } from '../../services/api.js'

const EMPTY_FORM = {
  code:          '',
  discountType:  'percent',
  discountValue: '',
  minOrderValue: '',
  expiryDate:    '',
  isActive:      true,
}

function CouponModal({ coupon, onClose, onSaved }) {
  const { showToast } = useToast()
  const isEdit = !!coupon

  const [form, setForm] = useState(
    isEdit
      ? {
          code:          coupon.code,
          discountType:  coupon.discountType,
          discountValue: String(coupon.discountValue),
          minOrderValue: String(coupon.minOrderValue),
          expiryDate:    coupon.expiryDate?.split('T')[0] || '',
          isActive:      coupon.isActive,
        }
      : { ...EMPTY_FORM }
  )
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code || !form.discountValue || !form.expiryDate) {
      showToast('Code, discount value, and expiry date are required', 'warning')
      return
    }

    const payload = {
      code:          form.code.toUpperCase().trim(),
      discountType:  form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrderValue: parseFloat(form.minOrderValue) || 0,
      expiryDate:    form.expiryDate,
      isActive:      form.isActive,
    }

    try {
      setSaving(true)
      if (isEdit) {
        await updateCoupon(coupon._id, payload)
        showToast('Coupon updated!', 'success')
      } else {
        await createCoupon(payload)
        showToast('Coupon created!', 'success')
      }
      onSaved()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save coupon', 'error')
    } finally {
      setSaving(false)
    }
  }

  const f = (name) => ({
    value: form[name],
    onChange: (e) => setForm((p) => ({ ...p, [name]: e.target.value })),
  })

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Coupon Code *</label>
              <input
                id="coupon-code-input"
                className="form-input"
                placeholder="e.g. SAVE20"
                style={{ textTransform: 'uppercase' }}
                {...f('code')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select className="form-select" {...f('discountType')}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Discount Value {form.discountType === 'percent' ? '(%)' : '(₹)'}
              </label>
              <input
                id="coupon-value-input"
                className="form-input"
                type="number"
                min={0}
                placeholder={form.discountType === 'percent' ? '10' : '50'}
                {...f('discountValue')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Order Value (₹)</label>
              <input className="form-input" type="number" min={0} placeholder="0" {...f('minOrderValue')} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input className="form-input" type="date" {...f('expiryDate')} />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
              <input
                type="checkbox"
                id="coupon-active-toggle"
                className="checkbox-custom"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              <label htmlFor="coupon-active-toggle" className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                Active
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-coupon-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Coupon' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const { showToast } = useToast()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editCoupon, setEditCoupon] = useState(null)

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await getAllCoupons()
      setCoupons(res.data)
    } catch {
      showToast('Failed to load coupons', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCoupons() }, [])

  const handleToggle = async (id) => {
    try {
      await toggleCoupon(id)
      fetchCoupons()
    } catch {
      showToast('Failed to toggle coupon', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return
    try {
      await deleteCoupon(id)
      showToast('Coupon deleted', 'success')
      fetchCoupons()
    } catch {
      showToast('Failed to delete coupon', 'error')
    }
  }

  const isExpired = (date) => new Date(date) < new Date()

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page-title">Coupons</h1>
          <p className="admin-page-subtitle">{coupons.length} coupons</p>
        </div>
        <button
          id="create-coupon-btn"
          className="btn btn-primary"
          onClick={() => { setEditCoupon(null); setShowModal(true) }}
        >
          + Create Coupon
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    No coupons yet. Click "Create Coupon" to add one.
                  </td>
                </tr>
              )}
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiryDate)
                return (
                  <tr key={coupon._id}>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: 'var(--tea-green-dark)',
                          background: 'var(--tea-green-pale)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 4,
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>
                    <td>
                      {coupon.discountType === 'percent'
                        ? `${coupon.discountValue}% off`
                        : `₹${coupon.discountValue} off`}
                    </td>
                    <td>₹{coupon.minOrderValue}</td>
                    <td style={{ fontSize: '0.8125rem', color: expired ? 'var(--error)' : 'var(--gray-600)' }}>
                      {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                      {expired && ' (Expired)'}
                    </td>
                    <td>
                      <span className={`badge ${coupon.isActive && !expired ? 'badge-green' : 'badge-red'}`}>
                        {expired ? 'Expired' : coupon.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          id={`edit-coupon-${coupon._id}`}
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setEditCoupon(coupon); setShowModal(true) }}
                        >
                          Edit
                        </button>
                        <button
                          id={`toggle-coupon-${coupon._id}`}
                          className={`btn btn-sm ${coupon.isActive ? 'btn-ghost' : 'btn-secondary'}`}
                          style={{ color: coupon.isActive ? 'var(--warning)' : 'var(--success)' }}
                          onClick={() => handleToggle(coupon._id)}
                        >
                          {coupon.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          id={`delete-coupon-${coupon._id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(coupon._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <CouponModal
          coupon={editCoupon}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchCoupons() }}
        />
      )}
    </div>
  )
}
