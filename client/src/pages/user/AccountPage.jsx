import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/common/Navbar.jsx'
import Footer from '../../components/common/Footer.jsx'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getProfile, updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../services/api.js'

const EMPTY_ADDR = { fullName: '', phone: '', doorNo: '', street: '', area: '', city: '', state: '', pincode: '' }

export default function AccountPage() {
  const navigate = useNavigate()
  const { user, updateUser, logoutUser } = useAuth()
  const { showToast } = useToast()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [savingProfile, setSavingProfile] = useState(false)

  const [addresses, setAddresses] = useState([])
  const [editAddrId, setEditAddrId] = useState(null)
  const [addrForm, setAddrForm] = useState(EMPTY_ADDR)
  const [showAddAddr, setShowAddAddr] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profRes, addrRes] = await Promise.all([getProfile(), getAddresses()])
        setProfile(profRes.data)
        setProfileForm({ firstName: profRes.data.firstName, lastName: profRes.data.lastName, phone: profRes.data.phone || '' })
        setAddresses(addrRes.data)
      } catch {
        showToast('Failed to load account data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const res = await updateProfile(profileForm)
      setProfile(res.data.user)
      updateUser(res.data.user)
      setEditingProfile(false)
      showToast('Profile updated!', 'success')
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSaveAddress = async () => {
    if (
      !addrForm.fullName.trim() ||
      !addrForm.phone.trim() ||
      !addrForm.doorNo.trim() ||
      !addrForm.street.trim() ||
      !addrForm.city.trim() ||
      !addrForm.state.trim() ||
      !addrForm.pincode.trim()
    ) {
      showToast('Please fill in all required fields marked with *', 'warning')
      return
    }

    try {
      if (editAddrId) {
        const res = await updateAddress(editAddrId, addrForm)
        setAddresses(res.data.addresses)
        showToast('Address updated successfully!', 'success')
      } else {
        const res = await addAddress(addrForm)
        setAddresses(res.data.addresses)
        showToast('Address saved successfully!', 'success')
      }
      setEditAddrId(null)
      setShowAddAddr(false)
      setAddrForm(EMPTY_ADDR)
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save address', 'error')
    }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Remove this address?')) return
    try {
      const res = await deleteAddress(id)
      setAddresses(res.data.addresses)
      showToast('Address removed', 'info')
    } catch {
      showToast('Failed to remove address', 'error')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await setDefaultAddress(id)
      setAddresses(res.data.addresses)
      showToast('Default address updated', 'success')
    } catch {
      showToast('Failed to update default address', 'error')
    }
  }

  const startEditAddr = (addr) => {
    setEditAddrId(addr._id)
    setAddrForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      doorNo: addr.doorNo || '',
      street: addr.street || '',
      area: addr.area || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
      isDefault: !!addr.isDefault,
    })
    setShowAddAddr(true)
    setTimeout(() => {
      document.getElementById('addr-fullName')?.focus()
      document.getElementById('addr-fullName')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  if (loading) return <><Navbar /><div className="page-wrapper"><LoadingSpinner /></div></>

  return (
    <>
      <Navbar />
      <main className="page-wrapper" style={{ paddingBottom: '4rem' }}>
        <div className="container" style={{ paddingTop: '2rem', maxWidth: 860 }}>
          <h1 className="section-title" style={{ marginBottom: '2rem' }}>My Account</h1>

          {/* ── Profile Card ─────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>👤 Profile</span>
              {!editingProfile && (
                <button id="edit-profile-btn" className="btn btn-secondary btn-sm" onClick={() => setEditingProfile(true)}>
                  Edit Profile
                </button>
              )}
            </div>
            <div className="card-body">
              {!editingProfile ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9375rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>First Name</div>
                    <div style={{ color: 'var(--gray-600)' }}>{profile?.firstName}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Last Name</div>
                    <div style={{ color: 'var(--gray-600)' }}>{profile?.lastName}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Email</div>
                    <div style={{ color: 'var(--gray-600)' }}>{profile?.email}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>Phone</div>
                    <div style={{ color: 'var(--gray-600)' }}>{profile?.phone || '—'}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        id="edit-first-name"
                        className="form-input"
                        value={profileForm.firstName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        id="edit-last-name"
                        className="form-input"
                        value={profileForm.lastName}
                        onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      id="edit-phone"
                      className="form-input"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button id="save-profile-btn" className="btn btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="btn btn-ghost" onClick={() => setEditingProfile(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Addresses ────────────────────────────────────────── */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📍 Saved Addresses</span>
              <button
                id="add-address-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => { setShowAddAddr(true); setEditAddrId(null); setAddrForm(EMPTY_ADDR) }}
              >
                + Add Address
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {addresses.length === 0 && !showAddAddr && (
                <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>No saved addresses yet.</p>
              )}

              {addresses.map((addr) => (
                <div key={addr._id} className="address-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{addr.fullName} · {addr.phone}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: 4 }}>
                        {addr.doorNo}, {addr.street}, {addr.area && `${addr.area}, `}{addr.city} — {addr.pincode}, {addr.state}
                      </div>
                      {addr.isDefault && <span className="badge badge-green mt-2">Default</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '1rem' }}>
                      {!addr.isDefault && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleSetDefault(addr._id)} style={{ fontSize: '0.75rem' }}>
                          Set Default
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => startEditAddr(addr)} style={{ fontSize: '0.75rem' }}>Edit</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDeleteAddress(addr._id)} style={{ color: 'var(--error)', fontSize: '0.75rem' }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add / Edit address form */}
              {showAddAddr && (
                <div style={{ border: '2px solid var(--tea-green)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', marginTop: '0.75rem', background: 'var(--white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--gray-800)' }}>
                      {editAddrId ? '✏️ Edit Address' : '➕ Add New Address'}
                    </h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddAddr(false); setEditAddrId(null) }}>✕ Close</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-fullName">Full Name *</label>
                      <input
                        id="addr-fullName"
                        className="form-input"
                        placeholder="e.g. John Doe"
                        value={addrForm.fullName}
                        onChange={(e) => setAddrForm((p) => ({ ...p, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-phone">Phone Number *</label>
                      <input
                        id="addr-phone"
                        className="form-input"
                        placeholder="e.g. 9876543210"
                        value={addrForm.phone}
                        onChange={(e) => setAddrForm((p) => ({ ...p, phone: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-doorNo">Door / Flat / House No *</label>
                      <input
                        id="addr-doorNo"
                        className="form-input"
                        placeholder="e.g. 12/A"
                        value={addrForm.doorNo}
                        onChange={(e) => setAddrForm((p) => ({ ...p, doorNo: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-street">Street / Road *</label>
                      <input
                        id="addr-street"
                        className="form-input"
                        placeholder="e.g. Gandhi Road"
                        value={addrForm.street}
                        onChange={(e) => setAddrForm((p) => ({ ...p, street: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-area">Area / Locality</label>
                      <input
                        id="addr-area"
                        className="form-input"
                        placeholder="e.g. T. Nagar"
                        value={addrForm.area}
                        onChange={(e) => setAddrForm((p) => ({ ...p, area: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-city">City *</label>
                      <input
                        id="addr-city"
                        className="form-input"
                        placeholder="e.g. Chennai"
                        value={addrForm.city}
                        onChange={(e) => setAddrForm((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-state">State *</label>
                      <input
                        id="addr-state"
                        className="form-input"
                        placeholder="e.g. Tamil Nadu"
                        value={addrForm.state}
                        onChange={(e) => setAddrForm((p) => ({ ...p, state: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="addr-pincode">Pincode *</label>
                      <input
                        id="addr-pincode"
                        className="form-input"
                        placeholder="e.g. 600017"
                        value={addrForm.pincode}
                        onChange={(e) => setAddrForm((p) => ({ ...p, pincode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button id="save-address-account-btn" className="btn btn-primary" onClick={handleSaveAddress}>
                      {editAddrId ? 'Update Address' : 'Save Address'}
                    </button>
                    <button className="btn btn-secondary" onClick={() => { setShowAddAddr(false); setEditAddrId(null); setAddrForm(EMPTY_ADDR) }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Customer Support & Contact ─────────────────────── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">💬 Customer Support & Help</span>
            </div>
            <div className="card-body">
              <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Need help with your orders, cancellation requests, or product inquiries? Reach out directly to our team:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'var(--tea-green-pale)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(58,107,74,0.15)' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>📞 Phone Support</div>
                  <a href="tel:9443321952" style={{ color: 'var(--tea-green-dark)', fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none' }}>
                    +91 9443321952
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Mon - Sat, 9:00 AM - 7:00 PM</div>
                </div>

                <div style={{ background: 'var(--tea-green-pale)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(58,107,74,0.15)' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>✉️ Email Support</div>
                  <a href="mailto:sknethajigroups@gmail.com" style={{ color: 'var(--tea-green-dark)', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', wordBreak: 'break-all' }}>
                    sknethajigroups@gmail.com
                  </a>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>Responses within 24 hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Logout ───────────────────────────────────────────── */}
          <div className="card">
            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--error)' }}>Log Out</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>You will be redirected to the login page.</div>
              </div>
              <button id="logout-btn" className="btn btn-danger" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  )
}
