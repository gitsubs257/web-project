import axios from 'axios'

// Base axios instance pointing to our Express backend
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ntc_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response interceptor: auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ntc_token')
      localStorage.removeItem('ntc_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const checkEmail = (email) => api.post('/auth/check-email', { email })
export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)

// ── User ────────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/user/profile')
export const updateProfile = (data) => api.put('/user/profile', data)
export const getAddresses = () => api.get('/user/addresses')
export const addAddress = (data) => api.post('/user/addresses', data)
export const updateAddress = (id, data) => api.put(`/user/addresses/${id}`, data)
export const deleteAddress = (id) => api.delete(`/user/addresses/${id}`)
export const setDefaultAddress = (id) => api.patch(`/user/addresses/${id}/default`)

// ── Products ────────────────────────────────────────────────────────────────
export const getProducts = () => api.get('/products')
export const getProductById = (id) => api.get(`/products/${id}`)
export const getAllProductsAdmin = () => api.get('/products/admin/all')
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// ── Cart ────────────────────────────────────────────────────────────────────
export const getCart = () => api.get('/cart')
export const addToCart = (data) => api.post('/cart', data)
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity })
export const removeCartItem = (itemId) => api.delete(`/cart/${itemId}`)
export const clearCart = () => api.delete('/cart/clear')

// ── Orders ──────────────────────────────────────────────────────────────────
export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = () => api.get('/orders/my')
export const getOrderById = (id) => api.get(`/orders/${id}`)
export const getAllOrdersAdmin = () => api.get('/orders/all')
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status })
export const getOrderStats = () => api.get('/orders/stats')
export const requestCancelOrder = (id, data) => api.post(`/orders/${id}/cancel-request`, data)
export const getCancellationRequests = () => api.get('/orders/cancellations')
export const reviewCancellationRequest = (id, data) => api.put(`/orders/${id}/review-cancellation`, data)

// ── Coupons ─────────────────────────────────────────────────────────────────
export const applyCoupon = (code, orderAmount) => api.post('/coupons/apply', { code, orderAmount })
export const getAllCoupons = () => api.get('/coupons')
export const createCoupon = (data) => api.post('/coupons', data)
export const updateCoupon = (id, data) => api.put(`/coupons/${id}`, data)
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`)
export const toggleCoupon = (id) => api.patch(`/coupons/${id}/toggle`)

export default api
