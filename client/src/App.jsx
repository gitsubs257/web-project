import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Toast from './components/common/Toast.jsx'

// Auth pages
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'

// User pages
import HomePage from './pages/user/HomePage.jsx'
import ProductDetailPage from './pages/user/ProductDetailPage.jsx'
import CartPage from './pages/user/CartPage.jsx'
import CheckoutPage from './pages/user/CheckoutPage.jsx'
import OrderSuccessPage from './pages/user/OrderSuccessPage.jsx'
import OrdersPage from './pages/user/OrdersPage.jsx'
import AccountPage from './pages/user/AccountPage.jsx'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminProducts from './pages/admin/AdminProducts.jsx'
import AdminOrders from './pages/admin/AdminOrders.jsx'
import AdminCancellations from './pages/admin/AdminCancellations.jsx'
import AdminCoupons from './pages/admin/AdminCoupons.jsx'

// Route guards
import PrivateRoute from './components/common/PrivateRoute.jsx'
import AdminRoute from './components/common/AdminRoute.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes: redirect to /login if not authenticated */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
        </Route>

        {/* Admin-protected routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="cancellations" element={<AdminCancellations />} />
            <Route path="coupons" element={<AdminCoupons />} />
          </Route>
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
