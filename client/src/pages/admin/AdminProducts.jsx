import { useState, useEffect, useRef } from 'react'
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct } from '../../services/api.js'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const EMPTY_VARIANT = { weight: '', price: '', stock: '' }

function ProductModal({ product, onClose, onSaved }) {
  const { showToast } = useToast()
  const fileRef = useRef()
  const isEdit = !!product

  const [form, setForm] = useState({
    name:        product?.name        || '',
    description: product?.description || '',
    category:    product?.category    || 'Tea',
  })
  const [variants, setVariants] = useState(
    product?.variants?.map((v) => ({ weight: v.weight, price: String(v.price), stock: String(v.stock) }))
    || [{ ...EMPTY_VARIANT }]
  )
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(product?.image ? `${BACKEND_URL}/${product.image}` : null)
  const [saving, setSaving] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const addVariant = () => setVariants((p) => [...p, { ...EMPTY_VARIANT }])
  const removeVariant = (idx) => setVariants((p) => p.filter((_, i) => i !== idx))
  const updateVariant = (idx, field, value) => {
    setVariants((p) => p.map((v, i) => (i === idx ? { ...v, [field]: value } : v)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { showToast('Product name is required', 'warning'); return }
    if (variants.length === 0) { showToast('Add at least one variant', 'warning'); return }

    // Validate variants
    for (const v of variants) {
      if (!v.weight.trim() || !v.price || !v.stock) {
        showToast('All variant fields (weight, price, stock) are required', 'warning')
        return
      }
    }

    const parsedVariants = variants.map((v) => ({
      weight: v.weight.trim(),
      price:  parseFloat(v.price),
      stock:  parseInt(v.stock, 10),
    }))

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('category', form.category)
    fd.append('variants', JSON.stringify(parsedVariants))
    if (imageFile) fd.append('image', imageFile)

    try {
      setSaving(true)
      if (isEdit) {
        await updateProduct(product._id, fd)
        showToast('Product updated!', 'success')
      } else {
        await createProduct(fd)
        showToast('Product created!', 'success')
      }
      onSaved()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Product Image</label>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
            >
              <div
                style={{
                  width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                  border: '1.5px solid var(--gray-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--gray-50)', flexShrink: 0, fontSize: '2rem',
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : '🍃'}
              </div>
              <div>
                <input
                  id="product-image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileRef.current.click()}
                >
                  {previewUrl ? 'Change Image' : 'Upload Image'}
                </button>
                <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 4 }}>
                  JPEG, PNG, WebP — max 5 MB
                </p>
              </div>
            </div>
          </div>

          {/* Name, Description, Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Product Name *</label>
              <input
                id="admin-product-name"
                className="form-input"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Varam Tea"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className="form-input"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g. CTC Tea"
              />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Product description..."
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Variants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Variants (Weight / Price / Stock)</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={addVariant} id="add-variant-btn">
                + Add Variant
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {variants.map((v, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    className="form-input"
                    placeholder="Weight (e.g. 500g)"
                    value={v.weight}
                    onChange={(e) => updateVariant(idx, 'weight', e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Price (₹)"
                    value={v.price}
                    min={0}
                    onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                  />
                  <input
                    className="form-input"
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    min={0}
                    onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeVariant(idx)}
                    aria-label="Remove variant"
                    style={{ color: 'var(--error)' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-product-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ product, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <h2 className="modal-title" style={{ marginBottom: '1rem' }}>⚠️ Delete Product?</h2>
        <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
          Are you sure you want to delete <strong>{product.name}</strong>? This action cannot be undone.
        </p>
        <div className="modal-footer" style={{ paddingTop: 0, borderTop: 'none' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button id="confirm-delete-btn" className="btn btn-danger" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}

export default function AdminProducts() {
  const { showToast } = useToast()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await getAllProductsAdmin()
      setProducts(res.data)
    } catch {
      showToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteTarget._id)
      showToast('Product deleted', 'success')
      setDeleteTarget(null)
      fetchProducts()
    } catch {
      showToast('Failed to delete product', 'error')
    }
  }

  return (
    <div>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} products in catalogue</p>
        </div>
        <button
          id="add-product-btn"
          className="btn btn-primary"
          onClick={() => { setEditProduct(null); setShowModal(true) }}
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                    No products yet. Click "Add Product" to create one.
                  </td>
                </tr>
              )}
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td>
                    {prod.image ? (
                      <img
                        src={`${BACKEND_URL}/${prod.image}`}
                        alt={prod.name}
                        style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 48, height: 48, background: 'var(--gray-100)',
                          borderRadius: 6, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '1.25rem',
                        }}
                      >
                        🍃
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{prod.name}</td>
                  <td>
                    <span className="badge badge-gray">{prod.category}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {prod.variants?.map((v) => (
                        <span
                          key={v.weight}
                          style={{
                            fontSize: '0.7rem', padding: '2px 6px',
                            background: v.stock > 0 ? 'var(--tea-green-pale)' : 'var(--error-bg)',
                            color: v.stock > 0 ? 'var(--tea-green)' : 'var(--error)',
                            borderRadius: 4, fontWeight: 500,
                          }}
                        >
                          {v.weight} ₹{v.price} ({v.stock})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${prod.isActive ? 'badge-green' : 'badge-gray'}`}>
                      {prod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        id={`edit-product-${prod._id}`}
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setEditProduct(prod); setShowModal(true) }}
                      >
                        Edit
                      </button>
                      <button
                        id={`delete-product-${prod._id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(prod)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchProducts() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
