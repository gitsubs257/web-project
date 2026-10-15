import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getAddresses, addAddress, createOrder, applyCoupon } from '../../services/api.js'

const PAYMENT_METHODS = [
  { id: 'COD',      label: 'Cash on Delivery', emoji: '💵', available: true },
  { id: 'Card',     label: 'Credit / Debit Card', emoji: '💳', available: false },
  { id: 'UPI',      label: 'UPI', emoji: '📱', available: false },
  { id: 'GooglePay',label: 'Google Pay', emoji: '🔵', available: false },
  { id: 'PhonePe',  label: 'PhonePe', emoji: '🟣', available: false },
  { id: 'Paytm',    label: 'Paytm', emoji: '🔵', available: false },
]

const EMPTY_ADDRESS = { fullName: '', phone: '', doorNo: '', street: '', area: '', city: '', state: '', pincode: '' }

function AddrField({ label, name, half, value, onChange, error }) {
  return (
    <div className="form-group" style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label className="form-label" htmlFor={`chk-${name}`}>{label}</label>
      <input
        id={`chk-${name}`}
        className={`form-input${error ? ' error' : ''}`}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  )
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { cart, clearCartState } = useCart()
  const { showToast } = useToast()

  // Get selected item IDs passed from Cart page
  const selectedItemIds = location.state?.selectedItemIds || []

  const [step, setStep] = useState(1) // 1 = Address, 2 = Payment
  const [savedAddresses, setSavedAddresses] = useState([])
  const [shippingAddr, setShippingAddr] = useState(null)    // selected address object
  const [billingAddr, setBillingAddr]   = useState(null)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [addingNewAddress, setAddingNewAddress] = useState(false)
  const [newAddr, setNewAddr] = useState(EMPTY_ADDRESS)
  const [addrErrors, setAddrErrors] = useState({})

  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  // Compute selected items
  const selectedItems = (cart?.items || []).filter((i) => selectedItemIds.includes(i._id))
  const subtotal = selectedItems.reduce((sum, item) => {
    const variant = item.product?.variants?.find((v) => v.weight === item.variantWeight)
    return sum + (variant?.price || 0) * item.quantity
  }, 0)

  const discount = couponResult?.discount || 0
  const deliveryCharge = 0
  const total = subtotal - discount + deliveryCharge

  useEffect(() => {
    if (selectedItemIds.length === 0) {
      navigate('/cart')
      return
    }
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      const res = await getAddresses()
      setSavedAddresses(res.data)
      // Pre-select default address
      const def = res.data.find((a) => a.isDefault) || res.data[0]
      if (def) setShippingAddr(def)
    } catch {}
  }

  // ── Address step ──────────────────────────────────────────────────────────
  const validateNewAddress = () => {
    const errs = {}
    if (!newAddr.fullName) errs.fullName = 'Required'
    if (!newAddr.phone)    errs.phone    = 'Required'
    if (!newAddr.doorNo)   errs.doorNo   = 'Required'
    if (!newAddr.street)   errs.street   = 'Required'
    if (!newAddr.city)     errs.city     = 'Required'
    if (!newAddr.state)    errs.state    = 'Required'
    if (!newAddr.pincode)  errs.pincode  = 'Required'
    setAddrErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSaveNewAddress = async () => {
    if (!validateNewAddress()) return
    try {
      const res = await addAddress(newAddr)
      setSavedAddresses(res.data.addresses)
      const added = res.data.addresses[res.data.addresses.length - 1]
      setShippingAddr(added)
      setAddingNewAddress(false)
      setNewAddr(EMPTY_ADDRESS)
      showToast('Address saved', 'success')
    } catch {
      showToast('Failed to save address', 'error')
    }
  }

  const handleConfirmAddress = () => {
    if (!shippingAddr) { showToast('Please select a shipping address', 'warning'); return }
    if (!billingSameAsShipping && !billingAddr) { showToast('Please select a billing address', 'warning'); return }
    setStep(2)
  }

  // ── Coupon ────────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponResult(null)
    setApplyingCoupon(true)
    try {
      const res = await applyCoupon(couponCode.trim(), subtotal)
      setCouponResult(res.data.coupon)
      showToast(`Coupon applied! ₹${res.data.coupon.discount.toFixed(0)} off`, 'success')
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon')
    } finally {
      setApplyingCoupon(false)
    }
  }

  // ── Place Order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (paymentMethod !== 'COD') return // Button is disabled for non-COD

    const effectiveBilling = billingSameAsShipping ? shippingAddr : billingAddr

    const orderItems = selectedItems.map((item) => ({
      productId: item.product._id,
      variantWeight: item.variantWeight,
      quantity: item.quantity,
    }))

    try {
      setPlacingOrder(true)
      const res = await createOrder({
        items: orderItems,
        shippingAddress: shippingAddr,
        billingAddress: effectiveBilling,
        paymentMethod,
        couponCode: couponResult?.code || '',
      })
      clearCartState()
      navigate(`/order-success/${res.data.order._id}`)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to place order', 'error')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="page-wrapper" style={{ paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '2.5rem' }}>
          <h1 className="section-title" style={{ marginBottom: '2rem' }}>Checkout</h1>

          {/* Step indicator */}
          <div className="step-indicator" style={{ marginBottom: '2.5rem', maxWidth: 400 }}>
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-circle">{step > 1 ? '✓' : '1'}</div>
              <span className="step-label">Address</span>
            </div>
            <div className={`step-line ${step > 1 ? 'done' : ''}`} />
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-circle">2</div>
              <span className="step-label">Payment</span>
            </div>
          </div>

          <div className="checkout-grid">
            {/* Left: Steps */}
            <div>
              {/* ── Step 1: Address ─────────────────────────────── */}
              {step === 1 && (
                <div className="card">
                  <div className="card-header">🏠 Shipping Address</div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Saved addresses */}
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`address-card ${shippingAddr?._id === addr._id ? 'selected' : ''}`}
                        onClick={() => setShippingAddr(addr)}
                        id={`addr-${addr._id}`}
                      >
                        <div style={{ fontWeight: 600 }}>{addr.fullName} · {addr.phone}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 4 }}>
                          {addr.doorNo}, {addr.street}, {addr.area && `${addr.area}, `}{addr.city} — {addr.pincode}, {addr.state}
                        </div>
                        {addr.isDefault && <span className="badge badge-green" style={{ marginTop: 6 }}>Default</span>}
                      </div>
                    ))}

                    {/* Add new address */}
                    {!addingNewAddress ? (
                      <button id="add-new-address-btn" className="btn btn-secondary" onClick={() => setAddingNewAddress(true)}>
                        + Add New Address
                      </button>
                    ) : (
                      <div style={{ border: '1.5px solid var(--tea-green)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                        <p style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--gray-800)' }}>New Address</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <AddrField label="Full Name *" name="fullName" value={newAddr.fullName} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.fullName} />
                          <AddrField label="Phone *" name="phone" half value={newAddr.phone} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.phone} />
                          <AddrField label="Door No / Building *" name="doorNo" half value={newAddr.doorNo} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.doorNo} />
                          <AddrField label="Street *" name="street" value={newAddr.street} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.street} />
                          <AddrField label="Area / Locality" name="area" half value={newAddr.area} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.area} />
                          <AddrField label="City *" name="city" half value={newAddr.city} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.city} />
                          <AddrField label="State *" name="state" half value={newAddr.state} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.state} />
                          <AddrField label="Pincode *" name="pincode" half value={newAddr.pincode} onChange={(n, v) => setNewAddr((p) => ({ ...p, [n]: v }))} error={addrErrors.pincode} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                          <button id="save-address-btn" className="btn btn-primary" onClick={handleSaveNewAddress}>Save Address</button>
                          <button className="btn btn-ghost" onClick={() => { setAddingNewAddress(false); setAddrErrors({}) }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Billing Address */}
                    <div className="divider" />
                    <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>💳 Billing Address</h3>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        className="checkbox-custom"
                        checked={billingSameAsShipping}
                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                        id="billing-same-checkbox"
                      />
                      Billing same as Shipping
                    </label>

                    {!billingSameAsShipping && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr._id}
                            className={`address-card ${billingAddr?._id === addr._id ? 'selected' : ''}`}
                            onClick={() => setBillingAddr(addr)}
                          >
                            <div style={{ fontWeight: 600 }}>{addr.fullName}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                              {addr.doorNo}, {addr.street}, {addr.city}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button id="confirm-address-btn" className="btn btn-primary" onClick={handleConfirmAddress}>
                      Confirm Address →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2: Payment ──────────────────────────────── */}
              {step === 2 && (
                <div className="card">
                  <div className="card-header">💳 Payment Method</div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`payment-option ${paymentMethod === method.id ? 'selected' : ''}`}
                        htmlFor={`pay-${method.id}`}
                      >
                        <input
                          type="radio"
                          id={`pay-${method.id}`}
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                        />
                        <span style={{ fontSize: '1.25rem' }}>{method.emoji}</span>
                        <span style={{ fontWeight: 500 }}>{method.label}</span>
                        {!method.available && (
                          <span className="badge badge-gray" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                            Unavailable
                          </span>
                        )}
                      </label>
                    ))}

                    {/* Unavailable payment warning */}
                    {paymentMethod !== 'COD' && (
                      <div className="alert alert-warning" id="payment-unavailable-msg">
                        ⚠️ This payment method is not available at the moment. Please choose Cash on Delivery.
                      </div>
                    )}

                    {/* Coupon */}
                    <div className="divider" />
                    <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>🏷️ Coupon Code</h3>
                    <div className="coupon-row">
                      <input
                        id="coupon-input"
                        className="form-input"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); setCouponResult(null) }}
                        style={{ textTransform: 'uppercase' }}
                      />
                      <button
                        id="apply-coupon-btn"
                        className="btn btn-secondary"
                        onClick={handleApplyCoupon}
                        disabled={applyingCoupon}
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <div className="form-error">{couponError}</div>}
                    {couponResult && (
                      <div className="alert alert-success">
                        ✓ Coupon applied: ₹{couponResult.discount.toFixed(0)} off
                      </div>
                    )}

                    <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={() => setStep(1)}>
                      ← Back to Address
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Price Summary */}
            <div className="cart-summary">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Price Summary</h2>

              {/* Items */}
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {selectedItems.map((item) => {
                  const variant = item.product?.variants?.find((v) => v.weight === item.variantWeight)
                  return (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--gray-600)' }}>
                        {item.product?.name} ({item.variantWeight}) × {item.quantity}
                      </span>
                      <span>₹{((variant?.price || 0) * item.quantity).toFixed(0)}</span>
                    </div>
                  )
                })}
              </div>

              <div className="divider" />
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="price-row discount">
                  <span>Coupon Discount</span>
                  <span>−₹{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="price-row">
                <span>Delivery</span>
                <span style={{ color: 'var(--success)' }}>Free</span>
              </div>
              <div className="price-row total">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>

              {step === 2 && (
                <button
                  id="confirm-order-btn"
                  className="btn btn-brown w-full mt-4"
                  style={{ justifyContent: 'center' }}
                  disabled={paymentMethod !== 'COD' || placingOrder}
                  onClick={handlePlaceOrder}
                >
                  {placingOrder ? 'Placing Order...' : '✓ Confirm Order (COD)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
